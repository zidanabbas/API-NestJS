import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

// TODO: belum diimplementasi — endpoint akan ditambahkan di sini.
@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {}
