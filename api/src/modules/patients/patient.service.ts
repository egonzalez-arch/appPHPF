import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly repo: Repository<Patient>,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['user'] });
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!p) throw new NotFoundException('Paciente no encontrado');
    return p;
  }

  async create(dto: CreatePatientDto) {
    const entity = this.repo.create({
      ...dto,
      // birthDate como string 'YYYY-MM-DD' la base la interpreta
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdatePatientDto) {
    const patient = await this.repo.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    // Evitar userId si viene (no permitido)
    if ('userId' in dto) {
      delete (dto as any).userId;
    }

    Object.assign(patient, dto);
    return this.repo.save(patient);
  }

  async remove(id: string) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Paciente no encontrado');
    await this.repo.remove(p);
    return { deleted: true };
  }
}