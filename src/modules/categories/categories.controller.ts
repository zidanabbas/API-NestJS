import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Buat kategori baru' })
  @ApiCreatedResponse({ description: 'Kategori berhasil dibuat' })
  @ApiConflictResponse({ description: 'Nama kategori sudah dipakai' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua kategori' })
  @ApiOkResponse({ description: 'Daftar kategori' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu kategori' })
  @ApiOkResponse({ description: 'Detail kategori' })
  @ApiNotFoundResponse({ description: 'Kategori tidak ditemukan' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update kategori' })
  @ApiOkResponse({ description: 'Kategori berhasil diperbarui' })
  @ApiNotFoundResponse({ description: 'Kategori tidak ditemukan' })
  @ApiConflictResponse({ description: 'Nama kategori sudah dipakai' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus kategori' })
  @ApiOkResponse({ description: 'Kategori berhasil dihapus' })
  @ApiNotFoundResponse({ description: 'Kategori tidak ditemukan' })
  @ApiConflictResponse({ description: 'Kategori masih memiliki produk' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
