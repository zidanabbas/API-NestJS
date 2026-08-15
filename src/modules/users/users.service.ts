import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll() {
    return this.usersRepository.findAll();
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    return this.usersRepository.create(dto);
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    return user;
  }
}
