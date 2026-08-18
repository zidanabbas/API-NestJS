import { PrismaService } from '#app/database/prisma.service.js';
import { Injectable } from '@nestjs/common';
import { Prisma } from '#app/generated/prisma/client.js';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PaymentCreateInput) {
    return this.prisma.payment.create({
      data,
    });
  }

  findById(id: number) {
    return this.prisma.payment.findUnique({
      where: { id },
    });
  }

  findByOrderId(orderId: number) {
    return this.prisma.payment.findUnique({
      where: { orderId },
    });
  }

  updateStatus(id: number, data: Prisma.PaymentUpdateInput) {
    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }
}
