import { PaymentMethod, PaymentStatus } from '#app/generated/prisma/enums.js';
import { ApiProperty } from '@nestjs/swagger';

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
    example: '60000',
    description: 'Decimal diserialisasi sebagai string',
  })
  amount!: string;

  @ApiProperty({ nullable: true, example: null })
  transactionId!: string | null;

  @ApiProperty({ nullable: true, example: 'QRIS-ORD-1755140400000-482' })
  qrString!: string | null;

  @ApiProperty({
    nullable: true,
    description: 'https://example.com/qr/ORD-...',
  })
  qrUrl!: string | null;

  @ApiProperty({
    nullable: true,
    example: null,
  })
  paidAt!: Date | null;

  @ApiProperty({ nullable: true })
  expiredAt!: Date | null;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty()
  createdAt!: Date;
}
