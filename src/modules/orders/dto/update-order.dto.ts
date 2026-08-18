import { OrderStatus } from '#app/generated/prisma/enums.js';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    description: 'Status tujuan harus mengikuti alur transaksi yang diizinkan',
  })
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
