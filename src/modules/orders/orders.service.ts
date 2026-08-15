import { PrismaService } from '#app/database/prisma.service.js';
import { Prisma } from '#app/generated/prisma/client.js';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { TablesRepository } from '#app/modules/tables/tables.repository.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly ordersRepository: OrdersRepository,

    private readonly tablesRepository: TablesRepository,
  ) {}

  async create(dto: CreateOrderDto) {
    const tableId = await this.resolveTableId(dto.tableCode);

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

          ...(tableId !== undefined && {
            table: {
              connect: { id: tableId },
            },
          }),
        },
      );

      for (const item of dto.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },

          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
        if (updated.count === 0) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId}`,
          );
        }
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

  private async resolveTableId(
    tableCode?: string,
  ): Promise<number | undefined> {
    if (!tableCode) {
      return undefined;
    }

    const table = await this.tablesRepository.findByCode(tableCode);

    if (!table) {
      throw new NotFoundException(`Table with code ${tableCode} not found`);
    }

    if (!table.isActive) {
      throw new BadRequestException(`Table ${table.name} is not available`);
    }

    return table.id;
  }

  private generateOrderNumber() {
    const timestamp = Date.now();

    const random = Math.floor(Math.random() * 1000);

    return `ORD-${timestamp}-${random}`;
  }
}
