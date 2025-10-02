import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsOptional,
  IsEmail,
  Length,
} from 'class-validator';

export class CreateClinicDto {
  @ApiProperty()
  @IsUUID()
  companyId: string;

  @ApiProperty()
  @IsString()
  @Length(2, 150)
  name: string;

  @ApiProperty()
  @IsString()
  @Length(2, 255)
  address: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, description: 'Formato libre, ej: L-V 09:00-18:00' })
  @IsOptional()
  @IsString()
  openingHours?: string;
}