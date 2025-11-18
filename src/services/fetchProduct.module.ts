import { Module } from '@nestjs/common';
import { FetchProductService } from './fetchProduct.service';

@Module({
  providers: [FetchProductService],
  exports: [FetchProductService],
})
export class FetchProductModule {}
