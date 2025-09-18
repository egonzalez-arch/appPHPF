import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configura Swagger / OpenAPI. Ruta: /docs
 */
export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('API - appPHPF')
    .setDescription(
      'Documentación de endpoints existentes (auth, patients, appointments, etc.).',
    )
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Introduce el token JWT sin el prefijo Bearer si así se configuró.',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
};