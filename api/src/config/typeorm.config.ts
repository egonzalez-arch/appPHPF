// typeorm.config.ts
// Configuración específica para NestJS (TypeOrmModule.forRootAsync)
// Usa TypeOrmModuleOptions que sí soporta autoLoadEntities.

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { User } from '../modules/users/user.entity';
import { join } from "path";
import { z } from 'zod';

/**
 * Retorna la configuración para TypeOrmModule (Nest).
 * No se usa directamente por el CLI de TypeORM (para eso: data-source.ts).
 */
  export const typeOrmConfig = (configService: ConfigService) : TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASS'),
    database: configService.get('DATABASE_NAME'),
    
    ssl: false,
    logging: true,
    entities: [join(__dirname, '../modules/**/*.entity.{ts,js}')],
    migrations: [join(__dirname, '/../migrations/*{.ts,.js}')],
    synchronize: true

})