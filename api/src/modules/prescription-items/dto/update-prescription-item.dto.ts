import { IsUUID, IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdatePrescriptionItemDto {
  @IsOptional()
  @IsUUID()
  prescriptionId?: string;

  @IsOptional()
  @IsString()
  medication?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  instructions?: string;
}