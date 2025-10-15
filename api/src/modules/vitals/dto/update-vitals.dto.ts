import { IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVitalsDto {
  @ApiPropertyOptional({ description: 'Altura en centímetros', example: 170 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ description: 'Peso en kilogramos', example: 70 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: 'Índice de masa corporal (calculado automáticamente)', example: 24.2 })
  @IsOptional()
  @IsNumber()
  bmi?: number;

  @ApiPropertyOptional({ description: 'Frecuencia cardíaca (lpm)', example: 80 })
  @IsOptional()
  @IsNumber()
  hr?: number;

  @ApiPropertyOptional({ description: 'Presión arterial (ejemplo: "120/80")', example: '120/80' })
  @IsOptional()
  @IsString()
  bp?: string;

  @ApiPropertyOptional({ description: 'Oximetría de pulso (SpO2 %)', example: 98 })
  @IsOptional()
  @IsNumber()
  spo2?: number;

  @ApiPropertyOptional({ description: 'Fecha y hora de registro', example: '2025-10-15T12:00:00.000Z' })
  @IsOptional()
  recordedAt?: Date;
}