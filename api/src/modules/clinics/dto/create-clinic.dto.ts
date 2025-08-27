import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateClinicDto {
  @IsUUID()
  companyId: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  address: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  openingHours?: string;
}