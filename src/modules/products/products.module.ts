import { Module } from '@nestjs/common';

import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { ProductsRepository } from './products.repository.js';

import { CategoriesModule } from '#app/modules/categories/categories.module.js';

@Module({
  imports: [CategoriesModule],

  controllers: [ProductsController],

  providers: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
