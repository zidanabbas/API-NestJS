import { Module } from '@nestjs/common';

import { MenusController } from './menus.controller.js';
import { MenusService } from './menus.service.js';
import { MenusRepository } from './menus.repository.js';

import { CategoriesModule } from '#app/modules/categories/categories.module.js';

@Module({
  imports: [CategoriesModule],
  controllers: [MenusController],
  providers: [MenusService, MenusRepository],
})
export class MenusModule {}
