import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDoctorCoreDto } from './create-doctor-core.dto';

export class CreateDoctorUserDto {
  @ApiProperty({ example: 'Ana' })
  firstName: string;

  @ApiProperty({ example: 'García' })
  lastName: string;

  @ApiProperty({ example: 'ana@example.com' })
  email: string;

  @ApiProperty({ minLength: 6 })
  password: string;

  @ApiProperty({ example: '+521555555555', required: false })
  phone?: string;
}

export class CreateDoctorWithUserDto {
  @ApiProperty({ type: CreateDoctorUserDto })
  @ValidateNested()
  @Type(() => CreateDoctorUserDto)
  user: CreateDoctorUserDto;

  @ApiProperty({ type: CreateDoctorCoreDto })
  @ValidateNested()
  @Type(() => CreateDoctorCoreDto)
  doctor: CreateDoctorCoreDto;
}