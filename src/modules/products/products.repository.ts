import { PrismaService } from '#app/database/prisma.service.js';
import { Prisma } from '#app/generated/prisma/client.js';
import { ProductUpdateInput } from '#app/generated/prisma/models.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  }

  findAll(search?: string) {
    return this.prisma.product.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  update(id: number, data: ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  delete(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
