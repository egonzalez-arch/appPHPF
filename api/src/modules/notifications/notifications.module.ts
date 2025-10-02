import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.servise';

@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}