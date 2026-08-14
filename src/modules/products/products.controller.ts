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
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ProductsService } from './products.service.js';

import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Buat produk baru' })
  @ApiCreatedResponse({ description: 'Produk berhasil dibuat' })
  @ApiNotFoundResponse({ description: 'Category tidak ditemukan' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua produk' })
  @ApiOkResponse({ description: 'Daftar produk beserta relasi category' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu produk' })
  @ApiOkResponse({ description: 'Detail produk beserta relasi category' })
  @ApiNotFoundResponse({ description: 'Produk tidak ditemukan' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update produk' })
  @ApiOkResponse({ description: 'Produk berhasil diperbarui' })
  @ApiNotFoundResponse({ description: 'Produk atau category tidak ditemukan' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus produk' })
  @ApiOkResponse({ description: 'Produk berhasil dihapus' })
  @ApiNotFoundResponse({ description: 'Produk tidak ditemukan' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
