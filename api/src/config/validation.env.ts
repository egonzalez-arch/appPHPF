import * as Joi from 'joi';

/**
 * Esquema opcional para validar variables de entorno críticas.
 * Integrar en AppModule con ConfigModule.forRoot({ validationSchema })
 */
export const envValidationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SSL: Joi.string().valid('true', 'false').default('false'),
  DB_LOGGING: Joi.string().valid('true', 'false').default('false'),
  JWT_SECRET: Joi.string().min(12).required(),
  JWT_EXPIRATION: Joi.string().default('3600s'),
});