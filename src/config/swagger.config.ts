import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Food Ordering API')
    .setDescription(
      [
        'REST API for a food ordering & dine-in table management system.',
        '',
        'Covers the full ordering flow: product catalog (categories & products), ',
        'customer orders with line items and stock control, dine-in tables, and payments.',
        '',
        '**Authentication:** JWT Bearer token — click **Authorize** and paste your access token.',
        '',
        '**Response format:** successful responses are wrapped as `{ success: true, data }`; ',
        'errors follow `{ success: false, statusCode, error, message, path, timestamp }`.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addTag('App', 'Health check & general endpoints')
    .addTag('Auth', 'Authentication & login')
    .addTag('Users', 'User registration & management')
    .addTag('Categories', 'Product categories (CRUD)')
    .addTag('Products', 'Products (CRUD)')
    .addTag('Orders', 'Orders & order items')
    .addTag('Tables', 'Dine-in tables (CRUD)')
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);
}
