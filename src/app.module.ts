import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';  // <-- TAMBAHKAN
import { PrismaProductsService } from './prisma/prisma-products.service';
import { registerProductNameValidator } from './common/validator/isUniqueProduct';

@Module({
  imports: [
    ProductModule,
    PrismaModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private readonly prismaProducts: PrismaProductsService) {
    registerProductNameValidator(prismaProducts);
  }
}
