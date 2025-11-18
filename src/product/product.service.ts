import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { PrismaProductsService } from 'src/prisma/prisma-products.service';
import { PrismaRatingsService } from 'src/prisma/prisma-ratings.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly pg: PrismaProductsService,
    private readonly mysql: PrismaRatingsService,
  ) {}

  async fetchAndStore() {
  // 1. Fetch data dari Fakestore API
  const { data } = await axios.get('https://fakestoreapi.com/products');

  const insertedProducts = [];

  for (const item of data) {
    const { id: productId, title, price, rating } = item;

    // 2. Cek apakah produk dengan name yang sama sudah ada (duplicate check)
    const exists = await this.pg.product.findFirst({
      where: { name: title, deletedAt: null },
    });

    if (exists) {
      continue; // skip duplicate
    }

    // 3. Insert ke PostgreSQL → products
    const createdProduct = await this.pg.product.create({
      data: {
        productId,
        name: title,
        price,
      },
    });

    // 4. Insert ke MySQL → ratings
    await this.mysql.rating.create({
      data: {
        productId,
        rate: rating?.rate ?? 0,
        count: rating?.count ?? 0,
      },
    });

    // kumpulkan data yang berhasil diinsert
    insertedProducts.push(createdProduct);
  }

  // 5. Return hanya data yang BARU diinsert pada request ini
  return insertedProducts;
}


  // CRUD bawaan NestJS (kita modifikasi)
  async findAll(page = 1, limit = 10) {
    return this.pg.product.findMany({
      where: { deletedAt: null },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string) {
    return this.pg.product.findUnique({ where: { id } });
  }

  async create(dto: any) {
    return this.pg.product.create({ data: dto });
  }

  async update(id: string, dto: any) {
    return this.pg.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, auth: string) {
    if (auth !== '3cdcnTiBsl') {
      throw new UnauthorizedException('Invalid Authorization header');
    }
    return this.pg.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
