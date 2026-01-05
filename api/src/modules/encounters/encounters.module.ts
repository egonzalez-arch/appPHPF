import { Module } from '@nestjs/common';
import { EncounterService } from './encounter.service';
import { EncounterController } from './encounter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encounter } from './encounter.entity';
import { AppointmentsModule } from '../appointments/appointments.module';
import { AuditEventsModule } from '../audit-events/audit-events.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Encounter]),
    // Asegura que los servicios necesarios estén disponibles en este contexto
    AppointmentsModule,
    AuditEventsModule,
  ],
  controllers: [EncounterController],
  providers: [EncounterService],
  exports: [EncounterService],
})
export class EncountersModule {}
