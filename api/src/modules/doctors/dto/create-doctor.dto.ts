import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDoctorDto {
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @IsString()
  specialty: string;

  @IsNotEmpty()
  @IsString()
  license: string;

  @IsOptional()
  @IsString()
  bio?: string;
}