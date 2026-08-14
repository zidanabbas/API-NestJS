import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApiConflictResponse,
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

@ApiTags('Tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new table' })
  @ApiCreatedData(TableResponseDto, { description: 'Table created' })
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
  @ApiOperation({ summary: 'Update a table' })
  @ApiOkData(TableResponseDto, { description: 'Table updated' })
  @ApiNotFoundResponse({
    description: 'Table not found',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Table number already in use',
    type: ErrorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTableDto,
  ) {
    return this.tablesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a table' })
  @ApiOkData(TableResponseDto, { description: 'Table deleted' })
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
