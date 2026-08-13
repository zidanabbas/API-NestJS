import { Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client.js';
import { PrismaService } from '@/database/prisma.service.js';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(tx: Prisma.TransactionClient, data: Prisma.OrderCreateInput) {
    return tx.order.create({
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  findById(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
      },
    });
  }

  updateStatus(id: number, status: Prisma.OrderUpdateInput['status']) {
    return this.prisma.order.update({
      where: { id },
      data: {
        status,
      },
    });
  }
}
