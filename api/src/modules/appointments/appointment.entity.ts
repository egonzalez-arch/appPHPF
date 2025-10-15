import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Doctor } from '../doctors/doctors.entity';
import { Clinic } from '../clinics/clinic.entity';
import { AppointmentStatus } from './appointment-status-enum';
import { Encounter } from '../encounters/encounter.entity'; // <-- AGREGAR ESTA LÍNEA

@Entity('appointments')
@Index(['doctorId', 'startAt', 'endAt'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clinicId: string;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinicId' })
  clinic: Clinic;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  doctorId: string;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column({ type: 'timestamp' })
  startAt: Date;

  @Column({ type: 'timestamp' })
  endAt: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  reason: string;

  // <----- AGREGAR ESTAS LÍNEAS PARA LA RELACIÓN 1:1 CON ENCOUNTER ----->

  @OneToOne(() => Encounter, encounter => encounter.appointment, { nullable: true })
  encounter: Encounter;

  // <------------------- FIN DEL BLOQUE AGREGADO ----------------------->

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}