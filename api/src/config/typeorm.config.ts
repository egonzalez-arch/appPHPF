import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from "path";

/**
 * TypeORM configuration factory for NestJS
 * Reads database configuration from environment variables
 * Note: synchronize is set to false to prepare for migrations
 */
export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
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
  // Disabled synchronize to prepare for migration-based schema management
  synchronize: false
});
