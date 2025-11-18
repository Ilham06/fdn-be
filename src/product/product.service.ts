import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { PaginationResult } from 'src/common/interfaces';
import { paginate } from 'src/common/utils/pagination';
import { PrismaProductsService } from 'src/prisma/prisma-products.service';
import { PrismaRatingsService } from 'src/prisma/prisma-ratings.service';
import { FetchProductService } from 'src/services/fetchProduct.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly pg: PrismaProductsService,
    private readonly mysql: PrismaRatingsService,
    private readonly fetchProduct: FetchProductService,
  ) { }

  async fetchAndStore() {
    
    const products = await this.fetchProduct.getProducts();

    const insertedProducts = [];

    for (const item of products) {
      const { id: productId, title, price, rating } = item;

      
      const exists = await this.pg.product.findFirst({
        where: { name: title, deletedAt: null },
      });

      if (exists) continue;

      
      const createdProduct = await this.pg.product.create({
        data: {
          name: title,
          price,
        } as any,
      });

      
      await this.mysql.rating.create({
        data: {
          productId,
          rate: rating?.rate ?? 0,
          count: rating?.count ?? 0,
        },
      });

      insertedProducts.push(createdProduct);
    }

    return insertedProducts;
  }


  async findAll(query: PaginationQueryDto): Promise<PaginationResult<any>> {
    return paginate(this.pg.product, query.page, query.limit, {
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }


  async findOne(productId: number) {
    const product = await this.pg.product.findFirst({
      where: { productId: productId },
    });

    if (!product) throw new NotFoundException('Product not found');

    const rating = await this.mysql.rating.findFirst({
      where: { productId: productId },
    });

    return {
      ...product,
      rating: rating ?? { rate: 0, count: 0 },
    };
  }


  async create(dto: CreateProductDto) {

    const exists = await this.pg.product.findFirst({
      where: { name: dto.name, deletedAt: null },
    });

    if (exists) throw new Error('Product name already exists');

    const product = await this.pg.product.create({
      data: {
        name: dto.name,
        price: dto.price,
      } as any,
    });


    if (dto.rating) {
      await this.mysql.rating.create({
        data: {
          productId: product.productId,
          rate: dto.rating.rate ?? 0,
          count: dto.rating.count ?? 0,
        },
      });
    }

    return product;
  }


  async update(productId: number, dto: UpdateProductDto) {
    const product = await this.pg.product.findFirst({
      where: { productId },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (dto.name && dto.name !== product.name) {
      const existingName = await this.pg.product.findUnique({
        where: { name: dto.name },
      });
      if (existingName) throw new BadRequestException('Name already exists');
    }

 
    const updated = await this.pg.product.update({
      where: { productId } as any,
      data: {
        name: dto.name,
        price: dto.price,
      },
    });

    
    if (dto.rating) {
      await this.mysql.rating.update({
        where: { productId } as any,
        data: {
          rate: dto.rating.rate,
          count: dto.rating.count,
        },
      });
    }

    return {
      ...updated,
      rating: dto.rating ?? (await this.mysql.rating.findUnique({ where: { productId } as any })),
    };
  }


  async remove(productId: number) {
    const product = await this.pg.product.findFirst({
      where: { productId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const deleted = await this.pg.product.update({
      where: { id: product.id },
      data: { deletedAt: new Date() },
    });


    await this.mysql.rating.deleteMany({
      where: { productId },
    });

    return deleted;
  }

}
