// Añadir SOLO si el archivo no existe todavía o no tiene validaciones.
// Si ya hay DTO con validaciones, mantener el existente y omitir este bloque.

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  IsEmail,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: 'Ana', minLength: 2, maxLength: 60 })
  @IsString()
  @Length(2, 60)
  firstName: string;

  @ApiProperty({ example: 'García', minLength: 2, maxLength: 60 })
  @IsString()
  @Length(2, 60)
  lastName: string;

  @ApiProperty({ example: 'ana@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1990-05-20', required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;
}