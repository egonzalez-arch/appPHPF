import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Insurer } from '../insurers/insurer.entity';
import { Patient } from '../patients/patient.entity';

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  insurerId: string;

  @ManyToOne(() => Insurer)
  @JoinColumn({ name: 'insurerId' })
  insurer: Insurer;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Index({ unique: true })
  @Column()
  policyNumber: string;

  @Column()
  planName: string;

  @Column()
  coverage: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'enum', enum: PolicyStatus, default: PolicyStatus.ACTIVE })
  status: PolicyStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}