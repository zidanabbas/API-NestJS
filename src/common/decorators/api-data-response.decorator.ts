import type { Type } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';

interface DataResponseOptions {
  isArray?: boolean;
  description?: string;
}

/**
 * ResponseInterceptor: `{ success: true, data: <model> }`.
 */
export function ApiOkData<TModel extends Type<unknown>>(
  model: TModel,
  options: DataResponseOptions = {},
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: options.description,
      schema: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: options.isArray
            ? { type: 'array', items: { $ref: getSchemaPath(model) } }
            : { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
}

/**
 * ResponseInterceptor: `{ success: true, data: <model> }`.
 */
export function ApiCreatedData<TModel extends Type<unknown>>(
  model: TModel,
  options: DataResponseOptions = {},
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiCreatedResponse({
      description: options.description,
      schema: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
}
