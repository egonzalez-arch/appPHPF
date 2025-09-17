import { IsString, IsOptional } from 'class-validator';

export class CreateClinicDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
