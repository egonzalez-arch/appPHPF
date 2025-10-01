import {TypeOrmModule} from '@nestjs/typeorm'
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule, ConfigService} from '@nestjs/config'

// Importa todos los módulos encontrados en api/src/modules/
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AuditEventsModule } from './modules/audit-events/audit-events.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClinicsModule } from './modules/clinics/clinic.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { EncountersModule } from './modules/encounters/encounters.module';
import { FamilyHistoryModule } from './modules/family-history/family-history.module';
import { InsurersModule } from './modules/insurers/insurers.module';
import { LabResultsModule } from './modules/lab-results/lab-results.module';
import { PatientFilesModule } from './modules/patient-files/patient-files.module';
import { PatientsModule } from './modules/patients/patients.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { PrescriptionItemsModule } from './modules/prescription-items/prescription-items.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { UsersModule } from './modules/users/users.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [ConfigService]

    }),
    AppointmentsModule,
    AuditEventsModule,
    AuthModule,
    ClinicsModule,
    CompaniesModule,
    DoctorsModule,
    EncountersModule,
    FamilyHistoryModule,
    InsurersModule,
    LabResultsModule,
    PatientFilesModule,
    PatientsModule,
    PoliciesModule,
    PrescriptionItemsModule,
    PrescriptionsModule,
    ReferralsModule,
    UsersModule,
    VitalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
