import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({ example: 'Meja 01', description: 'Table label/name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Table number (unique if set)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  number?: number;
}
