import { IsUUID, IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateAuditEventDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @IsOptional()
  @IsString()
  description?: string;
}