import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Food Ordering API visit /docs for the documentation.';
  }
}
