import { IsUUID, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateAuditEventDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  timestamp: Date;

  @IsString()
  description: string;

  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  entity?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  metadataJson?: any;
  
}
