import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  ApiCreatedData,
  ApiOkData,
} from '#app/common/decorators/api-data-response.decorator.js';
import { ErrorResponseDto } from '#app/common/dto/error-response.dto.js';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductResponseDto } from './dto/product-response.dto.js';
import { SearchProductDto } from './dto/query-product.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '#app/generated/prisma/enums.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new product (ADMIN ONLY)' })
  @ApiCreatedData(ProductResponseDto, { description: 'Product created' })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN role',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (optional ?search=)' })
  @ApiOkData(ProductResponseDto, {
    isArray: true,
    description: 'List of products with their category relation',
  })
  findAll(@Query() query: SearchProductDto) {
    return this.productsService.findAll(query.search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details' })
  @ApiOkData(ProductResponseDto, {
    description: 'Product details with its category relation',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a product (ADMIN ONLY)' })
  @ApiOkData(ProductResponseDto, { description: 'Product updated' })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN role',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product or category not found',
    type: ErrorResponseDto,
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a product (ADMIN ONLY)' })
  @ApiOkData(ProductResponseDto, { description: 'Product deleted' })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN role',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
