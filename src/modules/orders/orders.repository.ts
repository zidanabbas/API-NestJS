import { Injectable } from '@nestjs/common';
import { Prisma } from '#app/generated/prisma/client.js';
import { PrismaService } from '#app/database/prisma.service.js';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(tx: Prisma.TransactionClient, data: Prisma.OrderCreateInput) {
    return tx.order.create({
      data,
      include: {
        items: {
          include: {
            menu: true,
          },
        },
        table: true,
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            menu: true,
          },
        },
        table: true,
      },
    });
  }

  findById(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menu: true,
          },
        },
        payment: true,
        table: true,
      },
    });
  }

  updateStatus(id: number, status: Prisma.OrderUpdateInput['status']) {
    return this.prisma.order.update({
      where: { id },
      data: {
        status,
      },
      include: {
        items: {
          include: { menu: true },
        },
        table: true,
      },
    });
  }
}
