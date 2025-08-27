import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Doctor } from '../doctors/doctor.entity';

export enum ReferralStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  fromDoctorId: string;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'fromDoctorId' })
  fromDoctor: Doctor;

  @Column()
  toDoctorId: string;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'toDoctorId' })
  toDoctor: Doctor;

  @Column()
  reason: string;

  @Column({ type: 'enum', enum: ReferralStatus })
  status: ReferralStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}