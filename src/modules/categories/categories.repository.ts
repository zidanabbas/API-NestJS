import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service.js';
import { Prisma } from '@/generated/prisma/client.js';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({ data });
  }

  findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findByName(name: string) {
    return this.prisma.category.findUnique({
      where: { name },
    });
  }

  findById(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  update(id: number, data: Prisma.CategoryUpdateInput) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  delete(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  // Used to block deletion of a category that still has products (avoids raw FK errors).
  countProducts(categoryId: number) {
    return this.prisma.product.count({
      where: { categoryId },
    });
  }
}
