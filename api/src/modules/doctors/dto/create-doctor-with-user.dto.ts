import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDoctorCoreDto } from './create-doctor-core.dto';

export class DoctorUserDetailsDto {
  constructor() {
    console.log('Instanciando DoctorUserDetailsDto');
  }
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty({ required: false })
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