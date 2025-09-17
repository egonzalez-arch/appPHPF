# Migraciones TypeORM

- Generar migración a partir de entidades:
  ```
  npx typeorm-ts-node-commonjs migration:generate -d ./data-source.ts src/migrations/<nombre>
  ```
- Ejecutar migraciones:
  ```
  npx typeorm-ts-node-commonjs migration:run -d ./data-source.ts
  ```
- Revertir:
  ```
  npx typeorm-ts-node-commonjs migration:revert -d ./data-source.ts
  ```

Asegúrate de tener `data-source.ts` configurado con tus variables de entorno (.env).