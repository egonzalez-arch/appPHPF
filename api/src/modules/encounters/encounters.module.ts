import { Module } from '@nestjs/common';
import { EncounterService } from './encounter.service';
import { EncounterController } from './encounter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Encounter } from './encounter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Encounter])],
  controllers: [EncounterController],
  providers: [EncounterService],
})
export class EncountersModule {}
