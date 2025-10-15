import { IsUUID, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EncounterStatus } from '../encounter.entity'; 

export class UpdateEncounterDto {
  @ApiPropertyOptional({ description: 'ID de la cita asociada (si se modifica)', example: 'a9e3d5c2-6e77-4a1b-8f3a-1c9f573e9a1f' })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiPropertyOptional({ description: 'ID de la clínica', example: 'e8d2c5b3-6a1e-41d2-9d5d-12e4e83f7cdd' })
  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @ApiPropertyOptional({ description: 'ID del paciente', example: 'b82c1e64-3b4d-41d2-9d5d-63a5e83f7cfc' })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({ description: 'ID del doctor', example: 'f0e3d5c2-6e77-4a1b-8f3a-1c9f573e9a1f' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ description: 'Fecha y hora de la atención', example: '2025-10-15T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  encounterDate?: string;

  @ApiPropertyOptional({ description: 'Tipo de atención', example: 'consulta' })
  @IsOptional()
  @IsString()
  encounterType?: string;

  @ApiPropertyOptional({ description: 'Motivo principal de la atención (motivo de consulta)', example: 'Dolor abdominal agudo' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Diagnóstico principal', example: 'Gastritis aguda' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Notas clínicas o administrativas', example: 'Paciente refiere dolor de cabeza persistente los últimos 3 días.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: EncounterStatus, description: 'Estado del encuentro clínico' })
  @IsOptional()
  @IsEnum(EncounterStatus)
  status?: EncounterStatus;

  @ApiPropertyOptional({ description: 'ID del usuario que registra la atención', example: 'c12ab34e-56f7-89e0-12ab-34cd56ef7890' })
  @IsOptional()
  @IsUUID()
  createdBy?: string;
}