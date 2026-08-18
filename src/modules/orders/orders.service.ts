import { PrismaService } from '#app/database/prisma.service.js';
import { Prisma } from '#app/generated/prisma/client.js';
import { OrderStatus } from '#app/generated/prisma/enums.js';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from './orders.repository.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { TablesRepository } from '#app/modules/tables/tables.repository.js';
import { canTransition } from './constants/order-status.constant.js';

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
        const menu = await tx.menu.findUnique({
          where: {
            id: item.menuId,
          },
        });

        if (!menu) {
          throw new NotFoundException(`Menu ${item.menuId} not found`);
        }

        if (!menu.isActive) {
          throw new BadRequestException(`${menu.name} is not available`);
        }

        if (menu.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${menu.name}`,
          );
        }

        const price = Number(menu.price);

        const subtotal = price * item.quantity;

        totalAmount += subtotal;

        orderItems.push({
          menuId: menu.id,
          quantity: item.quantity,
          price: menu.price,
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
        const updated = await tx.menu.updateMany({
          where: {
            id: item.menuId,
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
            `Insufficient stock for menu ${item.menuId}`,
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

  async updateStatus(id: number, newStatus: OrderStatus) {
    const order = await this.findOne(id);

    if (order.status === newStatus) {
      throw new BadRequestException(`Order is already ${newStatus}`);
    }

    if (!canTransition(order.status, newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${order.status} to ${newStatus}`,
      );
    }

    return this.ordersRepository.updateStatus(id, newStatus);
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
