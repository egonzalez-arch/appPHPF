import * as Joi from 'joi';

/**
 * Environment variables validation schema
 * Validates critical environment variables for the application
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3001),

  // Database configuration (matches TypeORM config variable names)
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASS: Joi.string().allow(''),
  DB_SSL: Joi.boolean().default(false),

  // JWT configuration
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('3600s'),
});