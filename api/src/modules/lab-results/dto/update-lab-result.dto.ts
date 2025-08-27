import { IsUUID, IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateLabResultDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsString()
  testName?: string;

  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  @IsDateString()
  resultDate?: string;

  @IsOptional()
  @IsString()
  comments?: string;
}