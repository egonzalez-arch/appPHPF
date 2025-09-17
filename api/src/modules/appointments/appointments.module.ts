import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './appointment.entity';
import { AuditEventsModule } from '../audit-events/audit-events.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), AuditEventsModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentsModule {}
