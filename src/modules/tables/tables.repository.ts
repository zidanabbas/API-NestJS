import { Injectable } from '@nestjs/common';
import { Prisma } from '#app/generated/prisma/client.js';
import { PrismaService } from '#app/database/prisma.service.js';
import { TableUpdateInput } from '#app/generated/prisma/models.js';

type PrismaClientOrTx = PrismaService | Prisma.TransactionClient;

@Injectable()
export class TablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.TableCreateInput,
    client: PrismaClientOrTx = this.prisma,
  ) {
    return client.table.create({
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

  findById(id: number, client: PrismaClientOrTx = this.prisma) {
    return client.table.findUnique({
      where: { id },
    });
  }

  findByCode(code: string, client: PrismaClientOrTx = this.prisma) {
    return client.table.findUnique({
      where: { code },
    });
  }

  findByNumber(number: number, client: PrismaClientOrTx = this.prisma) {
    return client.table.findUnique({
      where: { number },
    });
  }

  // Used to auto-assign the next table number when the caller doesn't pick one.
  findLastByNumber(client: PrismaClientOrTx = this.prisma) {
    return client.table.findFirst({
      orderBy: { number: 'desc' },
      select: { number: true },
    });
  }

  update(
    id: number,
    data: TableUpdateInput,
    client: PrismaClientOrTx = this.prisma,
  ) {
    return client.table.update({
      where: { id },
      data,
    });
  }

  delete(id: number, client: PrismaClientOrTx = this.prisma) {
    return client.table.delete({
      where: { id },
    });
  }

  // Used to block deletion of a table that still has orders (avoids raw FK errors).
  countOrders(tableId: number, client: PrismaClientOrTx = this.prisma) {
    return client.order.count({
      where: { tableId },
    });
  }
}
