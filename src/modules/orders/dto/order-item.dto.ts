import { IsInt, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
export class CreateOrderItemDto {
  @ApiProperty({
    example: 1,
    description: 'Menu item ID',
  })
  @IsInt()
  @Min(1)
  menuId!: number;

  @ApiProperty({
    example: 2,
    description: 'Menu item quantity',
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}
