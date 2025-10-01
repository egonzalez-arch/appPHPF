import { Module } from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { VitalsController } from './vitals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vitals } from './vitals.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Vitals])],
  controllers: [VitalsController],
  providers: [VitalsService],
})
export class VitalsModule {}
