import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '#app/generated/prisma/client.js';
import { PrismaService } from '#app/database/prisma.service.js';
import { TablesRepository } from './tables.repository.js';
import { CreateTableDto } from './dto/create-table.dto.js';
import { UpdateTableDto } from './dto/update-table.dto.js';

type PrismaClientOrTx = PrismaService | Prisma.TransactionClient;

@Injectable()
export class TablesService {
  constructor(
    private readonly repository: TablesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateTableDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const number = await this.resolveNumber(dto.number, tx);
        const code = await this.generateUniqueCode(tx);

        return this.repository.create(
          {
            name: dto.name,
            number,
            code,
          },
          tx,
        );
      });
    } catch (error) {
      throw this.mapUniqueConstraintError(error, 'Table number already in use');
    }
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number, client: PrismaClientOrTx = this.prisma) {
    const table = await this.repository.findById(id, client);

    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }

  async findByCode(code: string) {
    const table = await this.repository.findByCode(code);

    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }

  async update(id: number, dto: UpdateTableDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.findOne(id, tx);

        if (dto.number !== undefined) {
          const existing = await this.repository.findByNumber(dto.number, tx);
          if (existing && existing.id !== id) {
            throw new ConflictException('Table number already in use');
          }
        }

        return this.repository.update(
          id,
          {
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.number !== undefined && { number: dto.number }),
          },
          tx,
        );
      });
    } catch (error) {
      throw this.mapUniqueConstraintError(error, 'Table number already in use');
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          await this.findOne(id, tx);

          const orderCount = await this.repository.countOrders(id, tx);
          if (orderCount > 0) {
            throw new ConflictException(
              'Table still has orders and cannot be deleted',
            );
          }

          return this.repository.delete(id, tx);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (this.isSerializationFailure(error)) {
        throw new ConflictException(
          'Table was modified concurrently, please retry',
        );
      }
      throw error;
    }
  }

  private async resolveNumber(
    number: number | undefined,
    tx: PrismaClientOrTx,
  ) {
    if (number !== undefined) {
      const existing = await this.repository.findByNumber(number, tx);
      if (existing) {
        throw new ConflictException('Table number already in use');
      }
      return number;
    }

    const last = await this.repository.findLastByNumber(tx);
    return (last?.number ?? 0) + 1;
  }

  private async generateUniqueCode(tx: PrismaClientOrTx): Promise<string> {
    let code = this.randomCode();

    while (await this.repository.findByCode(code, tx)) {
      code = this.randomCode();
    }

    return code;
  }

  private randomCode(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  private mapUniqueConstraintError(error: unknown, message: string) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException(message);
    }
    return error;
  }

  private isSerializationFailure(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    );
  }
}
