import { IsUUID, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateVitalsDto {
  @IsUUID()
  encounterId: string;

  @IsNumber()
  height: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  bmi: number;

  @IsNumber()
  hr: number;

  @IsString()
  bp: string;

  @IsNumber()
  spo2: number;

  @IsOptional()
  recordedAt?: Date;
}
