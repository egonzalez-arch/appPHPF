import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryFailedExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';

    // Handle specific PostgreSQL errors
    if (exception.driverError) {
      const driverError = exception.driverError as { code?: string };
      const { code } = driverError;

      switch (code) {
        case '23505': // unique_violation
          status = HttpStatus.CONFLICT;
          message = 'Resource already exists';
          break;
        case '23503': // foreign_key_violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Referenced resource does not exist';
          break;
        case '23502': // not_null_violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Required field is missing';
          break;
        case '23514': // check_violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Data constraint violation';
          break;
        case '42P01': // undefined_table
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database configuration error';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Database operation failed';
      }
    }

    this.logger.error({
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      message,
      query: exception.query,
      parameters: exception.parameters,
      driverError: (exception.driverError as { code?: string })?.code,
    });

    const errorResponse = {
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
