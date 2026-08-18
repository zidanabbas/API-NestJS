import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  PaymentStatus,
  OrderStatus,
  PaymentMethod,
} from '#app/generated/prisma/enums.js';

import { PaymentsRepository } from './payments.repository.js';
import { OrdersRepository } from '../orders/orders.repository.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

const PAYMENT_EXPIRY_MS = 15 * 60 * 1000;

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentsRepository,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  async create(dto: CreatePaymentDto) {
    const order = await this.ordersRepository.findById(dto.orderId);

    if (!order) {
      throw new NotFoundException(`Order ${dto.orderId} not found`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay a cancelled order');
    }

    const existing = await this.paymentRepository.findByOrderId(dto.orderId);
    if (existing)
      throw new ConflictException('Payment already exists for this order');

    return this.paymentRepository.create({
      method: PaymentMethod.QRIS,
      status: PaymentStatus.PENDING,
      amount: order.totalAmount,
      qrString: `QRIS-${order.orderNumber}`,
      qrUrl: `https://example.com/qr/${order.orderNumber}`,
      expiredAt: new Date(Date.now() + PAYMENT_EXPIRY_MS),
      order: { connect: { id: order.id } },
    });
  }

  async findOne(id: number) {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async updateStatus(id: number, status: PaymentStatus) {
    await this.findOne(id);
    return this.paymentRepository.updateStatus(id, {
      status,
      ...(status === PaymentStatus.PAID && { paidAt: new Date() }),
    });
  }
}
