import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Appointment } from '../appointments/appointment.entity';
import { User } from '../users/user.entity'; // Ajusta si tu entidad usuario tiene otro nombre

export enum EncounterStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
//export { EncounterStatus };

@Entity('encounters')
export class Encounter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación obligatoria 1:1 con Appointment
  @Column()
  appointmentId: string;

  @OneToOne(() => Appointment)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column({ type: 'timestamp', nullable: true })
  encounterDate?: Date; // Si quieres registrar hora real de atención

  @Column({ nullable: true })
  encounterType?: string; // Ej: consulta, urgencia, seguimiento

  @Column({ nullable: true })
  reason?: string; // Motivo de consulta

  @Column({ nullable: true })
  diagnosis?: string; // Diagnóstico principal

  @Column({ nullable: true })
  notes?: string; // Notas clínicas

  @Column({ type: 'enum', enum: EncounterStatus, default: EncounterStatus.IN_PROGRESS })
  status: EncounterStatus;

  @Column({ nullable: true })
  createdBy?: string; // userId de quien registra

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator?: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}