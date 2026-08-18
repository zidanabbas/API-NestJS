import { Injectable, NotFoundException } from '@nestjs/common';
import { MenusRepository } from './menus.repository.js';
import { CategoriesRepository } from '#app/modules/categories/categories.repository.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';
import { UpdateMenuDto } from './dto/update-menu.dto.js';
import { SearchMenuDto } from './dto/query-menu.dto.js';

@Injectable()
export class MenusService {
  constructor(
    private readonly menusRepository: MenusRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(dto: CreateMenuDto) {
    const category = await this.categoriesRepository.findById(dto.categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.menusRepository.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      imageUrl: dto.imageUrl,
      stock: dto.stock,
      category: {
        connect: {
          id: dto.categoryId,
        },
      },
    });
  }

  async findAll(query: SearchMenuDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [items, total] = await this.menusRepository.findAll({
      search: query.search,
      page,
      limit,
    });
    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const menu = await this.menusRepository.findById(id);
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return menu;
  }

  async update(id: number, dto: UpdateMenuDto) {
    await this.findOne(id);

    if (dto.categoryId !== undefined) {
      const category = await this.categoriesRepository.findById(dto.categoryId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.menusRepository.update(id, {
      ...(dto.name !== undefined && {
        name: dto.name,
      }),
      ...(dto.description !== undefined && {
        description: dto.description,
      }),
      ...(dto.price !== undefined && {
        price: dto.price,
      }),
      ...(dto.stock !== undefined && {
        stock: dto.stock,
      }),
      ...(dto.categoryId !== undefined && {
        category: {
          connect: {
            id: dto.categoryId,
          },
        },
      }),
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.menusRepository.delete(id);
  }
}
