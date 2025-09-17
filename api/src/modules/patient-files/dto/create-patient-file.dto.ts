import { IsUUID, IsString } from 'class-validator';

export class CreatePatientFileDto {
  @IsUUID()
  patientId: string;

  @IsString()
  fileUrl: string;

  @IsString()
  fileType: string;

  @IsString()
  description: string;
}
