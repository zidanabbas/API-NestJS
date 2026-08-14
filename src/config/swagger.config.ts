import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Food Ordering API')
    .setDescription('REST API for Food Ordering System')
    .setVersion('1.0')
    .addTag('App', 'Health check & general endpoints')
    .addTag('Auth', 'Authentication & login')
    .addTag('Users', 'User registration & management')
    .addTag('Categories', 'Product categories (CRUD)')
    .addTag('Products', 'Products (CRUD)')
    .addTag('Orders', 'Orders & order items')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);
}
