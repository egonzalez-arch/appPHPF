import { IsUUID, IsString, IsOptional } from 'class-validator';

export class UpdatePatientFileDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
