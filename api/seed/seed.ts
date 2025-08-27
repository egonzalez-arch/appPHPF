import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/modules/users/user.entity';
import { Doctor } from '../src/modules/doctors/doctor.entity';
import { Patient } from '../src/modules/patients/patient.entity';
import { Clinic } from '../src/modules/clinics/clinic.entity';
import { Company } from '../src/modules/companies/company.entity';
import { Insurer } from '../src/modules/insurers/insurer.entity';
import { Policy } from '../src/modules/policies/policy.entity';
import * as bcrypt from 'bcrypt';

const AppDataSource = new DataSource({
  type: 'postgres', // or 'mysql'
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User, Doctor, Patient, Clinic, Company, Insurer, Policy
  ],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();

  // Create admin user
  const admin = AppDataSource.manager.create(User, {
    email: 'admin@demo.com',
    passwordHash: await bcrypt.hash('admin123', 10),
    role: UserRole.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    status: 'ACTIVE',
  });

  // Create doctor user
  const docUser = AppDataSource.manager.create(User, {
    email: 'doc@demo.com',
    passwordHash: await bcrypt.hash('doc123', 10),
    role: UserRole.DOCTOR,
    firstName: 'John',
    lastName: 'Doe',
    status: 'ACTIVE',
  });

  // Create patient user
  const patUser = AppDataSource.manager.create(User, {
    email: 'pat@demo.com',
    passwordHash: await bcrypt.hash('pat123', 10),
    role: UserRole.PATIENT,
    firstName: 'Jane',
    lastName: 'Smith',
    status: 'ACTIVE',
  });

  await AppDataSource.manager.save([admin, docUser, patUser]);

  // Link doctor/patient profile
  const doctor = AppDataSource.manager.create(Doctor, {
    userId: docUser.id,
    specialty: 'Cardiology',
    license: 'ABC123',
    bio: 'Experienced Cardiologist',
  });

  const patient = AppDataSource.manager.create(Patient, {
    userId: patUser.id,
    birthDate: '1990-01-01',
    sex: 'F',
    bloodType: 'A+',
    allergies: ['Penicillin'],
    emergencyContact: { name: 'Bob Smith', phone: '555-1234' },
  });

  await AppDataSource.manager.save([doctor, patient]);

  // Company, clinic, insurer, policy
  const company = await AppDataSource.manager.save(
    AppDataSource.manager.create(Company, {
      name: 'HealthCorp',
      taxId: 'HC123456',
      address: '123 Main St',
      phone: '555-9999',
      email: 'info@healthcorp.com',
    })
  );

  const clinic = await AppDataSource.manager.save(
    AppDataSource.manager.create(Clinic, {
      companyId: company.id,
      name: 'HealthCorp Clinic',
      address: '456 Elm St',
      phone: '555-8888',
      email: 'clinic@healthcorp.com',
      openingHours: 'Mon-Fri 9-5',
    })
  );

  const insurer = await AppDataSource.manager.save(
    AppDataSource.manager.create(Insurer, {
      name: 'BestInsure',
      contactEmail: 'contact@bestinsure.com',
      phone: '555-7777',
    })
  );

  await AppDataSource.manager.save(
    AppDataSource.manager.create(Policy, {
      insurerId: insurer.id,
      patientId: patient.id,
      policyNumber: 'POL12345',
      planName: 'Gold',
      coverage: 'Full',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'ACTIVE',
    })
  );

  console.log('Seed complete.');
  process.exit(0);
}
seed();