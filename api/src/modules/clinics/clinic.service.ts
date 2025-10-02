import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Clinic } from './clinic.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { Company } from '../companies/company.entity';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private readonly repo: Repository<Clinic>,
    @InjectRepository(Company)
    private readonly companies: Repository<Company>,
  ) {}

  async findAll(search?: string, companyId?: string): Promise<Clinic[]> {
    const where: any[] = [];
    if (search) {
      where.push(
        { name: ILike(`%${search}%`), ...(companyId ? { companyId } : {}) },
        { address: ILike(`%${search}%`), ...(companyId ? { companyId } : {}) },
        { email: ILike(`%${search}%`), ...(companyId ? { companyId } : {}) },
      );
    } else if (companyId) {
      where.push({ companyId });
    }

    if (where.length === 0) {
      return this.repo.find({
        order: { createdAt: 'DESC' },
        relations: ['company'],
      });
    }

    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['company'],
    });
  }

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.repo.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async create(dto: CreateClinicDto): Promise<Clinic> {
    await this.ensureCompanyExists(dto.companyId);
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateClinicDto): Promise<Clinic> {
    const clinic = await this.findOne(id);
    if (dto.companyId && dto.companyId !== clinic.companyId) {
      await this.ensureCompanyExists(dto.companyId);
    }
    Object.assign(clinic, dto);
    return this.repo.save(clinic);
  }

  async remove(id: string): Promise<void> {
    const clinic = await this.findOne(id);
    await this.repo.remove(clinic);
  }

  private async ensureCompanyExists(companyId: string) {
    const exists = await this.companies.findOne({ where: { id: companyId } });
    if (!exists) throw new BadRequestException('Company does not exist');
  }
}