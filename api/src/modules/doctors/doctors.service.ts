import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Doctor } from './doctors.entity';
import { User, UserRole, UserStatus } from '../users/user.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreateDoctorWithUserDto } from './dto/create-doctor-with-user.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UpdateDoctorWithUserDto } from './dto/update-doctor-with-user.dto';
import * as bcrypt from 'bcrypt';

export interface SanitizedUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  phone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SanitizedDoctor {
  id: string;
  specialty: string;
  license: string;
  bio?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: SanitizedUser;
}

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor) private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  private sanitizeUser(user: User | null | undefined): SanitizedUser | undefined {
    if (!user) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest as SanitizedUser;
  }

  private sanitizeDoctor(d: Doctor | null | undefined): SanitizedDoctor | undefined {
    if (!d) return undefined;
    return {
      id: d.id,
      specialty: d.specialty,
      license: d.license,
      bio: d.bio ?? null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      user: this.sanitizeUser(d.user),
    };
  }

  async findAll(): Promise<SanitizedDoctor[]> {
    const list = await this.doctorRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return list.map((d) => this.sanitizeDoctor(d)!);
  }

  async findOne(id: string): Promise<SanitizedDoctor> {
    const doc = await this.doctorRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!doc) throw new NotFoundException('Doctor not found');
    return this.sanitizeDoctor(doc)!;
  }

  async create(dto: CreateDoctorDto): Promise<SanitizedDoctor> {
    // Validar que el usuario existe
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado para userId');

    const doctor = this.doctorRepo.create({
      userId: dto.userId,
      specialty: dto.specialty.trim(),
      license: dto.license.trim(),
      bio: dto.bio?.trim() || undefined,
    });
    await this.doctorRepo.save(doctor);

    const loaded = await this.doctorRepo.findOne({
      where: { id: doctor.id },
      relations: ['user'],
    });
    if (!loaded) throw new NotFoundException('Doctor not found after creation');
    return this.sanitizeDoctor(loaded)!;
  }

  async createWithUser(dto: CreateDoctorWithUserDto): Promise<SanitizedDoctor> {
    const {
      user: userDto,
      doctor: { specialty, license, bio },
    } = dto;

    return this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const doctorRepository = manager.getRepository(Doctor);

      // 1. Validar email único
      const exists = await userRepository.findOne({
        where: { email: userDto.email },
      });
      if (exists) throw new ConflictException('Email already in use');

      // 2. Crear usuario con los campos requeridos en users.entity.ts
      const passwordHash = await bcrypt.hash(userDto.password, 10);

      const user = userRepository.create({
        email: userDto.email.toLowerCase(),
        passwordHash,
        role: UserRole.DOCTOR,
        status: UserStatus.ACTIVE,
        firstName: userDto.firstName.trim(),
        lastName: userDto.lastName.trim(),
        phone: userDto.phone?.trim() || undefined,
      });
      await userRepository.save(user);

      // 3. Crear doctor, ligado al usuario recién creado
      const doctor = doctorRepository.create({
        userId: user.id,
        specialty: specialty.trim(),
        license: license.trim(),
        bio: bio && bio.trim() !== '' ? bio.trim() : undefined,
      });
      await doctorRepository.save(doctor);

      // 4. Devolver el doctor con relación usuario (ya sanitizado)
      const loaded = await doctorRepository.findOne({
        where: { id: doctor.id },
        relations: ['user'],
      });
      if (!loaded) {
        throw new NotFoundException('Doctor not found after creation');
      }
      return this.sanitizeDoctor(loaded)!;
    });
  }

  async update(id: string, dto: UpdateDoctorDto): Promise<SanitizedDoctor> {
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (dto.specialty !== undefined) doctor.specialty = dto.specialty.trim();
    if (dto.license !== undefined) doctor.license = dto.license.trim();
    if (dto.bio !== undefined) {
      doctor.bio =
        dto.bio && dto.bio.trim() !== '' ? dto.bio.trim() : undefined;
    }

    await this.doctorRepo.save(doctor);
    const reloaded = await this.doctorRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    return this.sanitizeDoctor(reloaded)!;
  }

  async updateWithUser(id: string, dto: UpdateDoctorWithUserDto): Promise<SanitizedDoctor> {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (dto.specialty !== undefined) doctor.specialty = dto.specialty.trim();
    if (dto.license !== undefined) doctor.license = dto.license.trim();
    if (dto.bio !== undefined) {
      doctor.bio =
        dto.bio && dto.bio.trim() !== '' ? dto.bio.trim() : undefined;
    }

    if (dto.firstName !== undefined) doctor.user.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) doctor.user.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) doctor.user.phone = dto.phone?.trim() || undefined;

    await this.userRepo.save(doctor.user);
    await this.doctorRepo.save(doctor);
    return this.sanitizeDoctor(doctor)!;
  }

  async disable(id: string): Promise<SanitizedDoctor> {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    doctor.user.status = UserStatus.INACTIVE;
    await this.userRepo.save(doctor.user);
    return this.sanitizeDoctor(doctor)!;
  }

  async enable(id: string): Promise<SanitizedDoctor> {
    const doctor = await this.doctorRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    doctor.user.status = UserStatus.ACTIVE;
    await this.userRepo.save(doctor.user);
    return this.sanitizeDoctor(doctor)!;
  }

  async remove(id: string): Promise<void> {
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    await this.doctorRepo.delete(id);
  }
}