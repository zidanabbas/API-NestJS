import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
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

import { ErrorResponseDto } from '#app/common/dto/error-response.dto.js';
import { TablesService } from './tables.service.js';
import { CreateTableDto } from './dto/create-table.dto.js';
import { UpdateTableDto } from './dto/update-table.dto.js';
import { TableResponseDto } from './dto/table-response.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserRole } from '#app/generated/prisma/enums.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('Tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new table (ADMIN ONLY)' })
  @ApiCreatedData(TableResponseDto, { description: 'Table created' })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN role',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Table number already in use',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateTableDto) {
    return this.tablesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tables' })
  @ApiOkData(TableResponseDto, {
    isArray: true,
    description: 'List of tables',
  })
  findAll() {
    return this.tablesService.findAll();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get table details by QR code' })
  @ApiOkData(TableResponseDto, { description: 'Table details' })
  @ApiNotFoundResponse({
    description: 'Table not found',
    type: ErrorResponseDto,
  })
  findByCode(@Param('code') code: string) {
    return this.tablesService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table details' })
  @ApiOkData(TableResponseDto, { description: 'Table details' })
  @ApiNotFoundResponse({
    description: 'Table not found',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a table (ADMIN ONLY)' })
  @ApiOkData(TableResponseDto, { description: 'Table updated' })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN role',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Table not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Table number already in use',
    type: ErrorResponseDto,
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTableDto) {
    return this.tablesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a table (ADMIN ONLY)' })
  @ApiOkData(TableResponseDto, { description: 'Table deleted' })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN role',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Table not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Table still has orders',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.remove(id);
  }
}
