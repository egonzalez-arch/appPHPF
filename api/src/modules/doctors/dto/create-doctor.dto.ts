import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateDoctorDto {
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  specialty: string;

  @IsNotEmpty()
  license: string;

  bio?: string;
}