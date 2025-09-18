import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global que formatea errores y evita revelar stack interno en respuestas.
 * Extensible para integrar un logger estructurado (pino/winston).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx     = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const request: Request   = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const baseMessage = isHttp
      ? (exception as HttpException).getResponse()
      : 'Internal server error';

    // Normaliza posibles formatos de HttpException (string u objeto)
    const normalized =
      typeof baseMessage === 'string'
        ? { message: baseMessage }
        : (baseMessage as Record<string, unknown>);

    const payload = {
      statusCode: status,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      ...normalized,
    };

    // Placeholder de logging (reemplazar con logger estructurado más adelante)
    // eslint-disable-next-line no-console
    console.error('[ERROR]', JSON.stringify(payload), exception);

    response.status(status).json(payload);
  }
}