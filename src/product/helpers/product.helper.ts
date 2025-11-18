import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaProductsService } from 'src/prisma/prisma-products.service';

export class ProductHelper {
  constructor(private readonly pg: PrismaProductsService) {}

  async ensureExist(productId: number) {
    const product = await this.pg.product.findUnique({ where: { productId } } as any);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async validateNameOnUpdate(newName: string, currentName: string) {
    if (!newName || newName === currentName) return;

    const exists = await this.pg.product.findFirst({
      where: { name: newName, deletedAt: null },
    });
  
    if (exists) throw new BadRequestException('Product name already exists');
  }

  async validateNameOnCreate(name: string) {
    const exists = await this.pg.product.findFirst({
      where: { name, deletedAt: null },
    });

    if (exists) throw new BadRequestException('Product name already exists');
  }
}
