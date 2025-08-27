import { IsUUID, IsString, IsDateString } from 'class-validator';

export class CreateLabResultDto {
  @IsUUID()
  patientId: string;

  @IsString()
  testName: string;

  @IsString()
  result: string;

  @IsDateString()
  resultDate: string;

  @IsString()
  comments: string;
}