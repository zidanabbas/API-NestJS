import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Buat pesanan baru (beserta item-nya)' })
  @ApiCreatedResponse({ description: 'Pesanan berhasil dibuat' })
  @ApiBadRequestResponse({
    description: 'Produk nonaktif atau stok tidak mencukupi',
  })
  @ApiNotFoundResponse({ description: 'Produk tidak ditemukan' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua pesanan' })
  @ApiOkResponse({ description: 'Daftar pesanan beserta item & produk' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu pesanan' })
  @ApiOkResponse({ description: 'Detail pesanan beserta item, produk & payment' })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }
}
