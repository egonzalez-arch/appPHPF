import { Module } from '@nestjs/common';
import { LabResultService } from './lab-result.service';
import { LabResultController } from './lab-result.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabResult } from './lab-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LabResult])],
  controllers: [LabResultController],
  providers: [LabResultService],
})
export class LabResultsModule {}
