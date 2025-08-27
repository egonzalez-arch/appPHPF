import { IsUUID, IsString, IsNumber } from 'class-validator';

export class CreatePrescriptionItemDto {
  @IsUUID()
  prescriptionId: string;

  @IsString()
  medication: string;

  @IsString()
  dosage: string;

  @IsNumber()
  quantity: number;

  @IsString()
  instructions: string;
}