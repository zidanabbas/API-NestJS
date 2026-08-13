import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CategoriesRepository } from './categories.repository.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.repository.findByName(dto.name);

    if (existing) {
      throw new ConflictException('Category already exists');
    }

    return this.repository.create({
      name: dto.name,
    });
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number) {
    const category = await this.repository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.repository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException('Category name already in use');
      }
    }

    return this.repository.update(id, {
      name: dto.name,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const hasProducts = await this.repository.countProducts(id);
    if (hasProducts > 0) {
      throw new ConflictException(
        'Category still has products and cannot be deleted',
      );
    }

    return this.repository.delete(id);
  }
}
