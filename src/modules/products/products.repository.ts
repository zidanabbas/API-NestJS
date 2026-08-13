import { PrismaService } from '@/database/prisma.service.js';
import { Prisma } from '@/generated/prisma/client.js';
import { ProductUpdateInput } from '@/generated/prisma/models.js';
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

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
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
