import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaProductsService } from 'src/prisma/prisma-products.service';
import { PrismaRatingsService } from 'src/prisma/prisma-ratings.service';
import { FetchProductService } from 'src/services/fetchProduct.service';
import { RatingHelper } from './helpers/rating.helper';
import { paginate } from 'src/common/utils/pagination';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { ProductHelper } from './helpers/product.helper';

@Injectable()
export class ProductService {
  private ratingHelper: RatingHelper;
  private productHelper: ProductHelper;

  constructor(
    private readonly pg: PrismaProductsService,
    private readonly mysql: PrismaRatingsService,
    private readonly fetchProduct: FetchProductService,
  ) {
    this.ratingHelper = new RatingHelper(this.mysql);
    this.productHelper = new ProductHelper(this.pg);
  }


  // fetch data
  async fetchAndStore() {
    const externalProducts = await this.fetchProduct.getProducts();
    if (!externalProducts.length) return [];

    const names = externalProducts.map((p: { title: string; }) => p.title);

    const existingProducts = await this.pg.product.findMany({
      where: { name: { in: names }, deletedAt: null },
      select: { name: true },
    });

    const existingNames = new Set(existingProducts.map((p) => p.name));

    const newProducts = externalProducts.filter(
      (p: { title: string; }) => !existingNames.has(p.title),
    );

    if (!newProducts.length) return [];


    const created = await this.pg.$transaction(async (tx) => {
      return tx.product.createManyAndReturn({
        data: newProducts.map((item: { title: string; price: number; }) => ({
          name: item.title,
          price: item.price,
        })),
      });
    });

    const ratingsPayload = created.map((p, i) => ({
      productId: p.productId,
      rate: newProducts[i].rating?.rate ?? 0,
      count: newProducts[i].rating?.count ?? 0,
    }));


    await this.mysql.$transaction(async (tx) => {
      await tx.rating.createMany({
        data: ratingsPayload,
      });
    });

    return created;
  }


  async findAll(query: PaginationQueryDto) {
    return paginate(this.pg.product, query.page, query.limit, {
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(productId: number) {
    const product = await this.pg.product.findFirst({
      where: { productId, deletedAt: null },
    });

    if (!product) throw new NotFoundException('Product not found');

    return {
      ...product,
      rating: await this.ratingHelper.get(productId),
    };
  }

  async create(dto: CreateProductDto) {

    return this.pg.$transaction(async (pgTx) => {
      const product = await pgTx.product.create({
        data: { name: dto.name, price: dto.price },
      });

      if (dto.rating) {
        await this.mysql.$transaction(async (mysqlTx) => {
          await mysqlTx.rating.create({
            data: {
              productId: product.productId,
              rate: dto?.rating?.rate ?? 0,
              count: dto?.rating?.count ?? 0,
            },
          });
        });
      }

      return product;
    });
  }

  async update(productId: number, dto: UpdateProductDto) {
    const product = await this.productHelper.ensureExist(productId);
    console.log(product.name, dto.name)
    await this.productHelper.validateNameOnUpdate(dto.name!, product.name);
    return this.pg.$transaction(async (pgTx) => {
      const updated = await pgTx.product.update({
        where: { productId },
        data: {
          name: dto.name ?? product.name,
          price: dto.price ?? product.price,
        },
      });

      let rating = await this.ratingHelper.get(productId);

      if (dto.rating) {
        const existingRating = await this.mysql.rating.findFirst({
          where: { productId },
        });

        if (existingRating) {
          await this.mysql.rating.update({
            where: { id: existingRating.id },
            data: {
              rate: dto.rating.rate,
              count: dto.rating.count,
            },
          });
        } else {
          await this.mysql.rating.create({
            data: {
              productId,
              rate: dto.rating.rate ?? 0,
              count: dto.rating.count ?? 0,
            },
          });
        }
      }



      return { ...updated, rating };
    });
  }

  async remove(productId: number) {
    await this.productHelper.ensureExist(productId);

    return this.pg.$transaction(async (pgTx) => {
      const deleted = await pgTx.product.update({
        where: { productId },
        data: { deletedAt: new Date() },
      });

      await this.mysql.$transaction(async (mysqlTx) => {
        await mysqlTx.rating.deleteMany({ where: { productId } });
      });

      return deleted;
    });
  }
}
