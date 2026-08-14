import { Injectable } from '@nestjs/common';
import { Prisma } from '#app/generated/prisma/client.js';
import { PrismaService } from '#app/database/prisma.service.js';
import { TableUpdateInput } from '#app/generated/prisma/models.js';

@Injectable()
export class TablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.TableCreateInput) {
    return this.prisma.table.create({
      data,
    });
  }

  findAll() {
    return this.prisma.table.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findById(id: number) {
    return this.prisma.table.findUnique({
      where: { id },
    });
  }

  findByCode(code: string) {
    return this.prisma.table.findUnique({
      where: { code },
    });
  }

  findByNumber(number: number) {
    return this.prisma.table.findUnique({
      where: { number },
    });
  }

  // Used to auto-assign the next table number when the caller doesn't pick one.
  findLastByNumber() {
    return this.prisma.table.findFirst({
      orderBy: { number: 'desc' },
      select: { number: true },
    });
  }

  update(id: number, data: TableUpdateInput) {
    return this.prisma.table.update({
      where: { id },
      data,
    });
  }

  delete(id: number) {
    return this.prisma.table.delete({
      where: { id },
    });
  }

  // Used to block deletion of a table that still has orders (avoids raw FK errors).
  countOrders(tableId: number) {
    return this.prisma.order.count({
      where: { tableId },
    });
  }
}
