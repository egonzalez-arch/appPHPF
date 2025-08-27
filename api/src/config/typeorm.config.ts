import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { User } from '../modules/users/user.entity';
import { join } from "path";
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number(),
  DATABASE_USER: z.string(),
  DATABASE_PASS: z.string(),
  DATABASE_NAME: z.string(),
});

  export const typeOrmConfig = (configService: ConfigService) : TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASS'),
    database: configService.get('DATABASE_NAME'),
    
    ssl: true,
    logging: true,
    entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: true

})


  

