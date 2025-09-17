import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateInsurerDto {
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
