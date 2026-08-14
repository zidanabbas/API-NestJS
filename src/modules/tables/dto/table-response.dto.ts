import { ApiProperty } from '@nestjs/swagger';

export class TableResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'a8f3x9' })
  code!: string;

  @ApiProperty({ example: 1 })
  number!: number;

  @ApiProperty({ example: 'Meja 01' })
  name!: string;

  @ApiProperty({ example: true, description: 'Whether the table is active' })
  isActive!: boolean;

  @ApiProperty({ example: '2026-08-14T09:22:13.000Z', format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-14T09:22:13.000Z', format: 'date-time' })
  updatedAt!: Date;
}
