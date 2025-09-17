import { plainToInstance, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  validateSync,
  Min,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  PORT: number = 3001;

  // Database
  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  DATABASE_PORT: number = 5432;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  @IsOptional()
  DATABASE_PASS: string = '';

  @IsString()
  DATABASE_NAME: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  TYPEORM_LOGGING: boolean = false;

  // JWT
  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '3600s';

  // Security
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  BCRYPT_SALT_ROUNDS: number = 10;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');

    throw new Error(`Environment validation failed: ${errorMessages}`);
  }

  return validatedConfig;
}
