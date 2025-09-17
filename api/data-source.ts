import 'dotenv/config';
import { DataSource } from 'typeorm';

const isSSL = (process.env.DB_SSL ?? 'false') === 'true';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: isSSL ? { rejectUnauthorized: false } : false,
  synchronize: false,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
});