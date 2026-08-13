import { IsInt, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
export class CreateOrderItemDto {
  @ApiProperty({
    example: 1,
    description: 'Id Product',
  })
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiProperty({
    example: 2,
    description: 'Jumlah product',
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}
