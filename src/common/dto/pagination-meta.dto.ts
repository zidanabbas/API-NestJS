import { ApiProperty } from '@nestjs/swagger';

/**
 * Metadata pagination (daftar berhalaman).
 */
export class PaginationMetaDto {
  @ApiProperty({
    example: 42,
    description: 'Total item keseluruhan (setelah filter)',
  })
  total!: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Item per halaman' })
  limit!: number;

  @ApiProperty({
    example: 5,
    description: 'Jumlah halaman = ceil(total / limit)',
  })
  totalPages!: number;
}
