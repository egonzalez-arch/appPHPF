import { Module } from '@nestjs/common';
import { PrescriptionItemService } from './prescription-item.service';
import { PrescriptionItemController } from './prescription-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionItem } from './prescription-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrescriptionItem])],
  controllers: [PrescriptionItemController],
  providers: [PrescriptionItemService],
})
export class PrescriptionItemsModule {}
