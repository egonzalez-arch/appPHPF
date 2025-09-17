import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const duration = Date.now() - now;

          // Log in the format: [GET] /appointments 200 +45ms
          this.logger.log(`[${method}] ${url} ${statusCode} +${duration}ms`);
        },
        error: (error) => {
          const duration = Date.now() - now;
          const statusCode = error?.status || 500;

          this.logger.error(
            `[${method}] ${url} ${statusCode} +${duration}ms - ${error?.message || 'Unknown error'}`,
          );
        },
      }),
    );
  }
}
