import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FetchProductService } from 'src/services/fetchProduct.service';
import { FetchProductModule } from 'src/services/fetchProduct.module';


@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [PrismaModule, FetchProductModule]
})
export class ProductModule {}
