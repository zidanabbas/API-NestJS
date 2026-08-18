import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({
    example: '1',
    description: 'Menu category ID',
  })
  @IsInt()
  @Min(1)
  categoryId!: number;

  @ApiProperty({
    example: 'Nasi Goreng Spesial',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    example: 'Nasi Goreng dengan telur dan ayam spesial',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 25000,
  })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    example: 'https://example.com/nasi-goreng.jpg',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: 10,
  })
  @IsInt()
  @Min(0)
  stock!: number;
}
