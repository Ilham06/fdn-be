import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PrismaProductsService } from 'src/prisma/prisma-products.service';

let prisma: PrismaProductsService;

export function registerProductNameValidator(prismaService: PrismaProductsService) {
  prisma = prismaService;
}

export function IsUniqueProductName(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsUniqueProductName',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        async validate(value: any, _args: ValidationArguments) {
          if (!value) return true;

          if (!prisma) {
            return true;
          }

          const exists = await prisma.product.findFirst({
            where: { name: value, deletedAt: null },
          });

          return !exists;
        },

        defaultMessage(): string {
          
          return 'Product name already exists';
        },

        
      },
    });
  };
}
