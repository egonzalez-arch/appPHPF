import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateVitalsDto {
  @IsOptional()
  height?: number;

  @IsOptional()
  weight?: number;

  @IsOptional()
  bmi?: number;

  @IsOptional()
  hr?: number;

  @IsOptional()
  bp?: string;

  @IsOptional()
  spo2?: number;

  @IsOptional()
  recordedAt?: Date;
}
