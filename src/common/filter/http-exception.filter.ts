import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const logMessage = `HTTP Exception: ${status} - ${request.method} ${request.url}`;
    const logDetail =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.stack
          : 'Internal server error';

    // 5xx = kegagalan server sungguhan -> error. 4xx = kesalahan pemanggil
    // (route salah, input invalid, dst) -> cukup warn, jangan bikin noise di log.
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(logMessage, logDetail);
    } else {
      this.logger.warn(logMessage);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      message:
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Internal server error',
    });
  }
}
