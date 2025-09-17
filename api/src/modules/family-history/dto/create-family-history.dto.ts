import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateFamilyHistoryDto {
  @IsUUID()
  patientId: string;

  @IsString()
  relation: string;

  @IsString()
  condition: string;

  @IsOptional()
  @IsString()
  comments?: string;
}
