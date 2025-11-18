import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PrismaProductsClient } from '../../../node_modules/.prisma/products';

@Injectable()
export class PrismaProductsService
  extends PrismaProductsClient
  implements OnModuleInit, OnModuleDestroy
{
  
  async onModuleInit() {
    await this.$connect();
    
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
