import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard error envelope returned by HttpExceptionFilter for every failed request.
 */
export class ErrorResponseDto {
  @ApiProperty({
    example: false,
    description: 'Always false for error responses',
  })
  success!: false;

  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode!: number;

  @ApiProperty({
    example: 'Not Found',
    description: 'HTTP status reason phrase',
  })
  error!: string;

  @ApiProperty({
    description:
      'Human-readable error message. A single string for most errors, or an array of strings for validation errors.',
    oneOf: [
      { type: 'string', example: 'Order not found' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['email must be an email'],
      },
    ],
  })
  message!: string | string[];

  @ApiProperty({
    example: '/api/v1/orders/99',
    description: 'Request path that produced the error',
  })
  path!: string;

  @ApiProperty({
    example: '2026-08-14T09:22:13.000Z',
    description: 'ISO timestamp of when the error occurred',
  })
  timestamp!: string;
}
