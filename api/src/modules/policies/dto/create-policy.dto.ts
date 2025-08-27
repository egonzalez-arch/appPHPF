import { IsUUID, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';
import { PolicyStatus } from '../policy.entity';

export class CreatePolicyDto {
  @IsUUID()
  insurerId: string;

  @IsUUID()
  patientId: string;

  @IsNotEmpty()
  policyNumber: string;

  @IsNotEmpty()
  planName: string;

  @IsNotEmpty()
  coverage: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(PolicyStatus)
  status: PolicyStatus;
}