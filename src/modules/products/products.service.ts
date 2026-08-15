import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository.js';
import { CategoriesRepository } from '#app/modules/categories/categories.repository.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(dto: CreateProductDto) {
    const category = await this.categoriesRepository.findById(dto.categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.productsRepository.create({
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

  async findAll(search?: string) {
    return this.productsRepository.findAll(search);
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.categoryId !== undefined) {
      const category = await this.categoriesRepository.findById(dto.categoryId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.productsRepository.update(id, {
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
    return this.productsRepository.delete(id);
  }
}
