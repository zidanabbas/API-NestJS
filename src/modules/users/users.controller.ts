import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import {
  ApiOkData,
  ApiCreatedData,
} from '#app/common/decorators/api-data-response.decorator.js';
import { ErrorResponseDto } from '#app/common/dto/error-response.dto.js';
import { JwtAuthGuard } from '#app/modules/auth/guards/jwt-auth.guard.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get all registered users (requires login)' })
  @ApiOkData(UserResponseDto, { isArray: true, description: 'List of users' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get user details by id' })
  @ApiOkData(UserResponseDto, { description: 'User Details' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedData(UserResponseDto, { description: 'User created' })
  @ApiConflictResponse({
    description: 'Email already registered',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
