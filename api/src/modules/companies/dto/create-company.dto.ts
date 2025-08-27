import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}