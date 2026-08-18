import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import appConfig from './config/app.config.js';
import databaseConfig from './config/database.config.js';
import jwtConfig from './config/jwt.config.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { TablesModule } from './modules/tables/tables.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env' : '.env.local',
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    TablesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
