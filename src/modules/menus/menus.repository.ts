import { PrismaService } from '#app/database/prisma.service.js';
import { Prisma } from '#app/generated/prisma/client.js';
import { MenuUpdateInput } from '#app/generated/prisma/models.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MenusRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MenuCreateInput) {
    return this.prisma.menu.create({
      data,
      include: {
        category: true,
      },
    });
  }

  findAll(params: { search?: string; page: number; limit: number }) {
    const { search, page, limit } = params;
    const where: Prisma.MenuWhereInput | undefined = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;

    return this.prisma.$transaction([
      this.prisma.menu.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.menu.count({ where }),
    ]);
  }

  findById(id: number) {
    return this.prisma.menu.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  update(id: number, data: MenuUpdateInput) {
    return this.prisma.menu.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  delete(id: number) {
    return this.prisma.menu.delete({
      where: { id },
    });
  }
}
