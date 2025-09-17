# Migraciones TypeORM

## Scripts disponibles en package.json

- Generar migración a partir de entidades:
  ```bash
  npm run migration:generate src/migrations/<nombre>
  ```

- Ejecutar migraciones:
  ```bash
  npm run migration:run
  ```

- Revertir última migración:
  ```bash
  npm run migration:revert
  ```

## Comandos directos (alternativos)

- Generar migración:
  ```bash
  npx typeorm-ts-node-commonjs migration:generate -d ./src/config/data-source.ts src/migrations/<nombre>
  ```
- Ejecutar migraciones:
  ```bash
  npx typeorm-ts-node-commonjs migration:run -d ./src/config/data-source.ts
  ```
- Revertir:
  ```bash
  npx typeorm-ts-node-commonjs migration:revert -d ./src/config/data-source.ts
  ```

## Notas importantes

- El archivo `data-source.ts` está configurado para usar las variables de entorno definidas en `.env`
- Asegúrate de tener configuradas correctamente las variables: DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASS, DATABASE_NAME
- Las migraciones están configuradas para usar PostgreSQL
- En la Fase 1, `synchronize` está deshabilitado para preparar el uso de migraciones