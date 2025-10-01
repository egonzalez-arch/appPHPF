import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Encounter } from '../encounters/encounter.entity';
import { PatientFile } from '../patient-files/patient-file.entity';

export enum LabResultStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Entity('lab_results')
export class LabResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  encounterId: string;

  @ManyToOne(() => Encounter)
  @JoinColumn({ name: 'encounterId' })
  encounter: Encounter;

  @Column()
  testName: string;

  @Column('float')
  value: number;

  @Column()
  unit: string;

  @Column({ type: 'enum', enum: LabResultStatus })
  status: LabResultStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  resultDate: Date;

  @Column({ nullable: true })
  fileId: string;

  @ManyToOne(() => PatientFile, { nullable: true })
  @JoinColumn({ name: 'fileId' })
  file: PatientFile;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
