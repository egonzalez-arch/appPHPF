import { Module } from '@nestjs/common';
import { PatientFileService } from './patient-file.service';
import { PatientFileController } from './patient-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientFile } from './patient-file.entity';

@Module({
   imports: [TypeOrmModule.forFeature([PatientFile])],
  controllers: [PatientFileController],
  providers: [PatientFileService],
})
export class PatientFilesModule {}
