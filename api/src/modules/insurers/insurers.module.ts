import { Module } from '@nestjs/common';
import { InsurerService } from './insurer.service';
import { InsurerController } from './insurer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insurer } from './insurer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Insurer])],
  controllers: [InsurerController],
  providers: [InsurerService],
})
export class InsurersModule {}
