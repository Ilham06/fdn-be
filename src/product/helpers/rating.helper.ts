import { PrismaRatingsService } from 'src/prisma/prisma-ratings.service';

export class RatingHelper {
  constructor(private readonly mysql: PrismaRatingsService) {}

  async upsert(productId: number, rate: number, count: number) {
    const exists = await this.mysql.rating.findFirst({
      where: { productId },
    });

    if (!exists) {
      return this.mysql.rating.create({
        data: { productId, rate, count },
      });
    }

    return this.mysql.rating.update({
      where: { id: exists.id },
      data: { rate, count },
    });
  }

  async get(productId: number) {
    return (
      (await this.mysql.rating.findFirst({
        where: { productId },
      })) ?? { rate: 0, count: 0 }
    );
  }
}
