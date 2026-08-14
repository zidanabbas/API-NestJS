import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { TablesRepository } from './tables.repository.js';
import { CreateTableDto } from './dto/create-table.dto.js';
import { UpdateTableDto } from './dto/update-table.dto.js';

@Injectable()
export class TablesService {
  constructor(private readonly repository: TablesRepository) {}

  async create(dto: CreateTableDto) {
    const number = await this.resolveNumber(dto.number);
    const code = await this.generateUniqueCode();

    return this.repository.create({
      name: dto.name,
      number,
      code,
    });
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number) {
    const table = await this.repository.findById(id);

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
    await this.findOne(id);

    if (dto.number !== undefined) {
      const existing = await this.repository.findByNumber(dto.number);
      if (existing && existing.id !== id) {
        throw new ConflictException('Table number already in use');
      }
    }

    return this.repository.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.number !== undefined && { number: dto.number }),
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const orderCount = await this.repository.countOrders(id);
    if (orderCount > 0) {
      throw new ConflictException(
        'Table still has orders and cannot be deleted',
      );
    }

    return this.repository.delete(id);
  }

  private async resolveNumber(number?: number) {
    if (number !== undefined) {
      const existing = await this.repository.findByNumber(number);
      if (existing) {
        throw new ConflictException('Table number already in use');
      }
      return number;
    }

    const last = await this.repository.findLastByNumber();
    return (last?.number ?? 0) + 1;
  }

  private async generateUniqueCode(): Promise<string> {
    let code = this.randomCode();

    while (await this.repository.findByCode(code)) {
      code = this.randomCode();
    }

    return code;
  }

  private randomCode(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }
}
