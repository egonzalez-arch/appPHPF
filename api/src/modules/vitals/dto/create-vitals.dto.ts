import { IsUUID, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVitalsDto {
  @ApiProperty({ description: 'ID del encounter relacionado', example: '4b8e6b78-e605-4b49-b3c7-8f59d5bc5d06' })
  @IsUUID()
  encounterId: string;

  @ApiProperty({ description: 'Altura en centímetros', example: 170 })
  @IsNumber()
  height: number;

  @ApiProperty({ description: 'Peso en kilogramos', example: 70 })
  @IsNumber()
  weight: number;

  @ApiPropertyOptional({ description: 'Índice de masa corporal (calculado automáticamente)', example: 24.2 })
  @IsOptional()
  @IsNumber()
  bmi?: number;

  @ApiProperty({ description: 'Frecuencia cardíaca (lpm)', example: 80 })
  @IsNumber()
  hr: number;

  @ApiProperty({ description: 'Presión arterial (ejemplo: "120/80")', example: '120/80' })
  @IsString()
  bp: string;

  @ApiProperty({ description: 'Oximetría de pulso (SpO2 %)', example: 98 })
  @IsNumber()
  spo2: number;

  @ApiPropertyOptional({ description: 'Fecha y hora de registro', example: '2025-10-15T12:00:00.000Z' })
  @IsOptional()
  recordedAt?: Date;
}