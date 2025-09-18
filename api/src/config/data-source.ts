// data-source.ts
// DataSource para el CLI de TypeORM (migraciones). NO usar autoLoadEntities aquí.
// Ajusta la ruta a entidades si las tienes en una carpeta distinta.

import 'dotenv/config';
import { DataSource } from 'typeorm';

const isTs = __filename.endsWith('.ts');

// Usa los mismos env que Nest
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres', // Sólo una vez
  database: process.env.DB_NAME ?? process.env.DB_DATABASE ?? 'phpf', // Sólo una vez
  ssl: (process.env.DB_SSL ?? 'false') === 'true'
    ? { rejectUnauthorized: false }
    : false,
  logging: (process.env.DB_LOGGING ?? 'false') === 'true',
  // IMPORTANTE: lista de entidades compiladas. Ajusta glob según tu build.
  entities: [
    isTs ? 'src/**/*.entity.ts' : 'dist/**/*.entity.js',
  ],
  migrations: [
    isTs ? 'src/migrations/**/*.ts' : 'dist/migrations/**/*.js',
  ],
  synchronize: false,
  migrationsRun: false,
});

export default AppDataSource;