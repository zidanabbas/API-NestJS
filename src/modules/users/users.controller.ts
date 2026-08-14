import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all registered users (requires login)' })
  @ApiOkResponse({ description: 'List of users', type: [UserResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User created', type: UserResponseDto })
  @ApiConflictResponse({ description: 'Email already registered' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
