import { IsUUID, IsString, IsOptional } from 'class-validator';

export class UpdateFamilyHistoryDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsString()
  relation?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}