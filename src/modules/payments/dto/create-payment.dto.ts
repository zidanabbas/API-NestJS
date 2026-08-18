import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: 'ID Order yang akan dibayarkan' })
  @IsInt()
  @Min(1)
  orderId!: number;
}
