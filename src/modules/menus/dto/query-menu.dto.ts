import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '#app/common/dto/pagination-query.dto.js';

export class SearchMenuDto extends PaginationQueryDto {
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
