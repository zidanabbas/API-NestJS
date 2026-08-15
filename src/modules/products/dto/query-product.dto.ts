import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchProductDto {
  /**
   * Cari produk berdasarkan nama atau deskripsi.
   */
  @ApiPropertyOptional({
    description: 'Cari produk berdasarkan nama atau deskripsi',
    example: 'kopi',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
