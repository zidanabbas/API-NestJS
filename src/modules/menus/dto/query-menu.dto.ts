import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchMenuDto {
  /**
   * Cari menu berdasarkan nama atau deskripsi.
   */
  @ApiPropertyOptional({
    description: 'Cari menu berdasarkan nama atau deskripsi',
    example: 'kopi',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
