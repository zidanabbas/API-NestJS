import { PrismaService } from '#app/database/prisma.service.js';
import { Prisma } from '#app/generated/prisma/client.js';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly ordersRepository: OrdersRepository,
  ) {}

  async create(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      const orderItems: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: {
            id: item.productId,
          },
        });

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (!product.isActive) {
          throw new BadRequestException(`${product.name} is not available`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}`,
          );
        }

        const price = Number(product.price);

        const subtotal = price * item.quantity;

        totalAmount += subtotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          subtotal,
        });
      }

      const orderNumber = this.generateOrderNumber();

      const order = await this.ordersRepository.create(
        tx,

        {
          orderNumber,

          customerName: dto.customerName,

          customerPhone: dto.customerPhone,

          totalAmount,

          items: {
            create: orderItems,
          },
        },
      );

      for (const item of dto.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },

          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });
  }

  async findAll() {
    return this.ordersRepository.findAll();
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private generateOrderNumber() {
    const timestamp = Date.now();

    const random = Math.floor(Math.random() * 1000);

    return `ORD-${timestamp}-${random}`;
  }
}
