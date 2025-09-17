import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateAuthDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
