import { Module } from '@nestjs/common';
import { PrismaProductsService } from './prisma-products.service';
import { PrismaRatingsService } from './prisma-ratings.service';

@Module({
  providers: [PrismaProductsService, PrismaRatingsService],
  exports: [PrismaProductsService, PrismaRatingsService],
})
export class PrismaModule {}
