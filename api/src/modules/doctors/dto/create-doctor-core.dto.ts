import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDoctorCoreDto {
  @ApiProperty({ example: 'Cardiología' })
  @IsString()
  specialty: string;

  @ApiProperty({ example: 'LIC-123456' })
  @IsString()
  license: string;

  @ApiPropertyOptional({ example: 'Más de 10 años de experiencia...' })
  @IsOptional()
  @IsString()
  bio?: string;
}