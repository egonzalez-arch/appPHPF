import { Module } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { ClinicController } from './clinic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from './clinic.entity';



@Module({
  imports: [TypeOrmModule.forFeature([Clinic])],
  controllers: [ClinicController],
  providers: [ClinicService],
})
export class ClinicsModule {}