import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { setupSwagger } from './config/swagger.config';
// (Opcional) import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global estricta
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Ajustar a false temporalmente si rompe flujos existentes.
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Interceptor (activar más adelante si deseas)
  // app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger
  setupSwagger(app);

  // (Opcional) CORS si no estaba habilitado
  app.enableCors();

  const port = process.env.PORT || 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API escuchando en puerto ${port}. Swagger: /docs`);
}
bootstrap();