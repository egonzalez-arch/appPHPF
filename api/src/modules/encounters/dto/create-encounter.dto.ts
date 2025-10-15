import { IsUUID, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EncounterStatus } from '../encounter.entity';

export class CreateEncounterDto {
  @ApiProperty({
    description: 'ID de la cita asociada (appointment)',
    example: 'a9e3d5c2-6e77-4a1b-8f3a-1c9f573e9a1f'
  })
  @IsUUID()
  appointmentId: string;

  @ApiPropertyOptional({ description: 'Fecha y hora real de la atención', example: '2025-10-15T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  encounterDate?: string;

  @ApiPropertyOptional({ description: 'Tipo de atención (consulta, urgencia, seguimiento)', example: 'consulta' })
  @IsOptional()
  @IsString()
  encounterType?: string;

  @ApiPropertyOptional({ description: 'Motivo principal de la atención', example: 'Dolor abdominal agudo' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Diagnóstico principal', example: 'Gastritis aguda' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Notas clínicas o administrativas', example: 'Paciente refiere dolor persistente.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: EncounterStatus, default: EncounterStatus.IN_PROGRESS, description: 'Estado del encuentro clínico' })
  @IsOptional()
  @IsEnum(EncounterStatus)
  status?: EncounterStatus;

  @ApiPropertyOptional({ description: 'ID del usuario que registra la atención', example: 'c12ab34e-56f7-89e0-12ab-34cd56ef7890' })
  @IsOptional()
  @IsUUID()
  createdBy?: string;
}