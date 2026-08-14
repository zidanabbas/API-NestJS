import { ApiProperty } from '@nestjs/swagger';

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '#app/generated/prisma/enums.js';
import { ProductResponseDto } from '#app/modules/products/dto/product-response.dto.js';
import { TableResponseDto } from '#app/modules/tables/dto/table-response.dto.js';

export class OrderItemResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  orderId!: number;

  @ApiProperty({ example: 1 })
  productId!: number;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({
    example: '25000.00',
    description: 'Unit price captured at purchase time (decimal string)',
  })
  price!: string;

  @ApiProperty({
    example: '50000.00',
    description: 'quantity * price (decimal string)',
  })
  subtotal!: string;

  @ApiProperty({
    type: () => ProductResponseDto,
    description: 'Purchased product',
  })
  product!: ProductResponseDto;
}

export class PaymentResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  orderId!: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.QRIS })
  method!: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @ApiProperty({
    example: '50000.00',
    description: 'Amount to pay (decimal string)',
  })
  amount!: string;

  @ApiProperty({ example: 'TRX-abc123', nullable: true })
  transactionId!: string | null;

  @ApiProperty({
    example: '00020101021226...',
    nullable: true,
    description: 'Raw QRIS payload string',
  })
  qrString!: string | null;

  @ApiProperty({ example: 'https://example.com/qr.png', nullable: true })
  qrUrl!: string | null;

  @ApiProperty({
    example: null,
    nullable: true,
    type: String,
    format: 'date-time',
    description: 'When the payment was completed',
  })
  paidAt!: Date | null;

  @ApiProperty({
    example: '2026-08-14T10:00:00.000Z',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  expiredAt!: Date | null;

  @ApiProperty({ example: '2026-08-14T09:22:13.000Z', format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-14T09:22:13.000Z', format: 'date-time' })
  updatedAt!: Date;
}

export class OrderResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({
    type: () => TableResponseDto,
    nullable: true,
    description:
      'Table the order was placed from. Null when ordered via the manual menu QR (no table).',
  })
  table!: TableResponseDto | null;

  @ApiProperty({ example: 'ORD-20260814-0001' })
  orderNumber!: string;

  @ApiProperty({ example: 'Zidane Abbas' })
  customerName!: string;

  @ApiProperty({ example: '08123456789' })
  customerPhone!: string;

  @ApiProperty({
    example: '50000.00',
    description: 'Total order amount (decimal string)',
  })
  totalAmount!: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status!: OrderStatus;

  @ApiProperty({ type: () => OrderItemResponseDto, isArray: true })
  items!: OrderItemResponseDto[];

  @ApiProperty({
    type: () => PaymentResponseDto,
    nullable: true,
    description: 'Payment details. Included on order detail; null otherwise.',
  })
  payment!: PaymentResponseDto | null;

  @ApiProperty({ example: '2026-08-14T09:22:13.000Z', format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-14T09:22:13.000Z', format: 'date-time' })
  updatedAt!: Date;
}
