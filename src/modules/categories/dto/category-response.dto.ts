import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Food' })
  name!: string;

  @ApiProperty({ example: true, description: 'Whether the category is active' })
  isActive!: boolean;

  @ApiProperty({ example: '2026-08-14T09:22:13.000Z', format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-14T09:22:13.000Z', format: 'date-time' })
  updatedAt!: Date;
}
