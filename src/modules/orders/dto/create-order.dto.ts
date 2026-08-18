import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
  IsArray,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
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

  @ApiPropertyOptional({
    example: 'a8f3x9',
    description:
      'Table QR code. Omit when ordering via the manual menu QR (no table).',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tableCode?: string;

  @ApiProperty({
    type: () => [CreateOrderItemDto],
    example: [
      {
        menuId: 1,
        quantity: 2,
      },
      {
        menuId: 2,
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
