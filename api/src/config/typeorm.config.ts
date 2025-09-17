import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { join } from "path";

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: configService.get<string>('database.type') as any,
  host: configService.get<string>('database.host'),
  port: configService.get<number>('database.port'),
  username: configService.get<string>('database.username'),
  password: configService.get<string>('database.password'),
  database: configService.get<string>('database.database'),
  
  ssl: configService.get<string>('nodeEnv') === 'production',
  logging: configService.get<string>('nodeEnv') === 'development',
  entities: [join(__dirname, '../modules/**/*.entity.{ts,js}')],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false, // Disabled for production safety
  namingStrategy: new SnakeNamingStrategy(),
});