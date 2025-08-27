import { IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateDoctorDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  specialty?: string;

  @IsOptional()
  license?: string;

  @IsOptional()
  bio?: string;
}