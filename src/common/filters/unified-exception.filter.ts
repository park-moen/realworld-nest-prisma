import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '../errors/base-domain.error';
import { randomUUID } from 'crypto';

@Catch()
export class UnifiedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnifiedExceptionFilter.name);
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const correlationId = this.getCorrelationId(request);
    const errorInfo = this.extractErrorInfo(exception);

    if (errorInfo.statusCode >= 500) {
      this.logger.error(errorInfo.message, errorInfo.stack);
    } else if (errorInfo.statusCode >= 400) {
      this.logger.warn(errorInfo.message);
    }

    response.status(errorInfo.statusCode).json({
      error: {
        code: errorInfo.code,
        message: errorInfo.message,
        statusCode: errorInfo.statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        correlationId,
        ...(errorInfo.details && { details: errorInfo.details }),
        ...(this.isDevelopment &&
          errorInfo.stack && { stack: errorInfo.stack }),
      },
    });
  }

  private extractErrorInfo(exception: unknown) {
    // DomainError
    if (exception instanceof DomainError) {
      return {
        code: exception.code,
        message: exception.message,
        statusCode: exception.httpStatus,
        details: exception.details ?? null,
        stack: exception.stack,
      };
    }

    // 2. Validation Error 처리 (422)
    if (exception instanceof UnprocessableEntityException) {
      const response = exception.getResponse() as any;

      return {
        code: response.code || 'VALIDATION.INVALID_INPUT',
        message: response.message || 'Validation failed',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        details: response.details || response.message,
      };
    }

    // HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      return {
        code: this.getHttpExceptionCode(status),
        message:
          typeof response === 'string'
            ? response
            : (response as any).message || 'Error',
        statusCode: status,
        stack: exception.stack,
      };
    }

    // 예상하지 못한 에러
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        this.isDevelopment && exception instanceof Error
          ? exception.message
          : 'An unexpected error occurred',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      stack: exception instanceof Error ? exception.stack : undefined,
    };
  }

  private getHttpExceptionCode(status: number): string {
    const httpExceptionErrorMessage: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION.INVALID_INPUT',
      500: 'INTERNAL_SERVER_ERROR',
    };

    return httpExceptionErrorMessage[status] || 'HTTP_ERROR';
  }

  private getCorrelationId(request: Request): string {
    const header = request.headers['x-correlation-id'];
    return (Array.isArray(header) ? header[0] : header) || randomUUID();
  }
}
