import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '#app/database/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

const SALT_ROUNDS = 10;

// Shape returned to callers that expose data via the API password is never selected.
const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: publicUserSelect });
  }

  // Includes the password hash
  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: publicUserSelect,
    });
  }
}
