import { ApiProperty } from '@nestjs/swagger';
import { MenuResponseDto } from './menu-response.dto.js';
import { PaginationMetaDto } from '#app/common/dto/pagination-meta.dto.js';

export class PaginatedMenuResponseDto {
  @ApiProperty({ type: [MenuResponseDto] })
  items!: MenuResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
