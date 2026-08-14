import { ApiProperty } from '@nestjs/swagger';

import { CategoryResponseDto } from '#app/modules/categories/dto/category-response.dto.js';

export class ProductResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the category this product belongs to',
  })
  categoryId!: number;

  @ApiProperty({ example: 'Special Fried Rice' })
  name!: string;

  @ApiProperty({
    example: 'Fried rice with egg and special chicken',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    example: '25000.00',
    description: 'Price serialized as a decimal string',
  })
  price!: string;

  @ApiProperty({
    example: 'https://example.com/nasi-goreng.jpg',
    nullable: true,
  })
  imageUrl!: string | null;

  @ApiProperty({ example: 10 })
  stock!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-08-14T09:22:13.000Z', format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-14T09:22:13.000Z', format: 'date-time' })
  updatedAt!: Date;

  @ApiProperty({
    type: () => CategoryResponseDto,
    description: 'Related category',
  })
  category!: CategoryResponseDto;
}
