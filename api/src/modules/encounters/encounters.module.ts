import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncounterService } from './encounter.service';
import { EncounterController } from './encounter.controller';
import { Encounter } from './encounter.entity';
import { AppointmentsModule } from '../appointments/appointments.module';
import { AuditEventsModule } from '../audit-events/audit-events.module';
import { Doctor } from '../doctors/doctors.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Encounter, Doctor]),
    AppointmentsModule,
    AuditEventsModule,
  ],
  controllers: [EncounterController],
  providers: [EncounterService],
  exports: [EncounterService],
})
export class EncountersModule {}