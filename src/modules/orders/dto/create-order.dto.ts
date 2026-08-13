import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  ValidateNested,
  ArrayMinSize,
  IsArray,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderItemDto } from './order-item.dto.js';

export class CreateOrderDto {
  @ApiProperty({
    example: 'Zidane Abbas',
  })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({
    example: '08123456789',
  })
  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @ApiProperty({
    type: () => [CreateOrderItemDto],
    example: [
      {
        productId: 1,
        quantity: 2,
      },
      {
        productId: 2,
        quantity: 1,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
