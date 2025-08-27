import { IsString, IsDateString, IsUUID } from 'class-validator';

export class CreatePolicyDto {
  @IsUUID()
  insurerId: string;

  @IsString()
  policyNumber: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}