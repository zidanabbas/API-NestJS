import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersRepository } from './orders.repository.js';
import { OrdersService } from './orders.service.js';
import { PrismaModule } from '#app/database/prisma.module.js';
import { TablesModule } from '#app/modules/tables/tables.module.js';

@Module({
  imports: [PrismaModule, TablesModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersRepository],
})
export class OrdersModule {}
