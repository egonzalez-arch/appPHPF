import { IsString, IsDateString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export enum PatientSex {
  M = 'M',
  F = 'F',
  O = 'O'
}

export class CreatePatientDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(PatientSex)
  sex: PatientSex;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}