import { IsString, IsDateString, IsUUID, IsOptional } from 'class-validator';

export class UpdatePolicyDto {
  @IsOptional()
  @IsUUID()
  insurerId?: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
