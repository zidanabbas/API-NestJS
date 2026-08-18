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
import { MenusService } from './menus.service.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';
import { UpdateMenuDto } from './dto/update-menu.dto.js';
import { MenuResponseDto } from './dto/menu-response.dto.js';
import { SearchMenuDto } from './dto/query-menu.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '#app/generated/prisma/enums.js';

@ApiTags('Menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new menu item (ADMIN ONLY)' })
  @ApiCreatedData(MenuResponseDto, { description: 'Menu item created' })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN role',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items (optional ?search=)' })
  @ApiOkData(MenuResponseDto, {
    isArray: true,
    description: 'List of menu items with their category relation',
  })
  findAll(@Query() query: SearchMenuDto) {
    return this.menusService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item details' })
  @ApiOkData(MenuResponseDto, {
    description: 'Menu item details with its category relation',
  })
  @ApiNotFoundResponse({
    description: 'Menu item not found',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update a menu item (ADMIN ONLY)' })
  @ApiOkData(MenuResponseDto, { description: 'Menu item updated' })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN role',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Menu item or category not found',
    type: ErrorResponseDto,
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a menu item (ADMIN ONLY)' })
  @ApiOkData(MenuResponseDto, { description: 'Menu item deleted' })
  @ApiForbiddenResponse({
    description: 'Requires ADMIN role',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Menu item not found',
    type: ErrorResponseDto,
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.remove(id);
  }
}
