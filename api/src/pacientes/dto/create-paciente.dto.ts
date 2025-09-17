import { IsString, IsOptional } from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  nombre!: string;

  @IsString()
  @IsOptional()
  telefono?: string;
}
