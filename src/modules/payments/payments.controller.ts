import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Get,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiConflictResponse,
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
import { PaymentsService } from './payments.service.js';
import { ErrorResponseDto } from '#app/common/dto/error-response.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { PaymentResponseDto } from './dto/payment-response.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '#app/generated/prisma/enums.js';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto.js';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a QRIS payment for an order' })
  @ApiCreatedData(PaymentResponseDto, { description: 'Payment Created' })
  @ApiNotFoundResponse({
    description: 'Order not found',
    type: ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Order cancelled',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Payment already exists',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment status by id' })
  @ApiOkData(PaymentResponseDto, { description: 'Payment details' })
  @ApiNotFoundResponse({
    description: 'Payment not found',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update payment status (ADMIN ONLY)' })
  @ApiOkData(PaymentResponseDto, { description: 'Payment status updated' })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN role',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found',
    type: ErrorResponseDto,
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentService.updateStatus(id, dto.status);
  }
}
