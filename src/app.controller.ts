import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('App')
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API root welcome message' })
  @ApiOkResponse({
    description: 'API is up and running',
    schema: {
      type: 'object',
      required: ['success', 'data'],
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'string',
          example:
            'Welcome to Food Ordering API visit /docs for the documentation.',
        },
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
