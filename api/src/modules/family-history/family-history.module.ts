import { Module } from '@nestjs/common';
import { FamilyHistoryService } from './family-history.service';
import { FamilyHistoryController } from './family-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyHistory } from './family-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyHistory])],
  controllers: [FamilyHistoryController],
  providers: [FamilyHistoryService],
})
export class FamilyHistoryModule {}
