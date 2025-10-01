import { Type } from 'class-transformer';
import { ValidateNested, IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDoctorCoreDto } from './create-doctor-core.dto';

// Nombre único para el DTO de usuario en doctores (evita colisión con DTOs globales)
export class DoctorUserDetailsDto {
  constructor() {
    console.log('Instanciando DoctorUserDetailsDto');
  }

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateDoctorWithUserDto {
  @ApiProperty({ type: DoctorUserDetailsDto })
  @ValidateNested()
  @Type(() => DoctorUserDetailsDto)
  user: DoctorUserDetailsDto;

  @ApiProperty({ type: CreateDoctorCoreDto })
  @ValidateNested()
  @Type(() => CreateDoctorCoreDto)
  doctor: CreateDoctorCoreDto;
}