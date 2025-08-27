import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { z } from 'zod';

const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_TYPE: z.enum(['postgres', 'mysql']),
  NODE_ENV: z.string().default('development'),
});

export function typeOrmConfig(config: ConfigService): TypeOrmModuleOptions {
  const env = envSchema.parse(process.env);
  return {
    type: env.DB_TYPE as any,
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    synchronize: env.NODE_ENV === 'development',
    migrationsRun: env.NODE_ENV !== 'development',
    namingStrategy: new SnakeNamingStrategy(),
    autoLoadEntities: true,
    logging: env.NODE_ENV === 'development',
    entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  };
}