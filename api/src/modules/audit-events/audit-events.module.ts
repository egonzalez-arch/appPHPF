import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditEventService } from './audit-event.service';
import { AuditEventController } from './audit-event.controller';
import { AuditEvent } from './audit-event.entity'; // Ajusta el nombre y la ruta si tu entidad se llama diferente

@Module({
  imports: [TypeOrmModule.forFeature([AuditEvent])],
  controllers: [AuditEventController],
  providers: [AuditEventService],
  exports: [AuditEventService], // Opcional, si necesitas el servicio en otros módulos
})
export class AuditEventsModule {}
