import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../src/modules/users/user.entity';
// ...otros imports...

// ...configuración del DataSource...

async function seed() {
  await AppDataSource.initialize();

  // Crear usuario admin
  const admin = AppDataSource.manager.create(User, {
    email: 'admin@demo.com',
    passwordHash: await bcrypt.hash('admin123', 10),
    role: UserRole.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    status: UserStatus.ACTIVE, // <-- CORRECTO
  });

  // Crear usuario doctor
  const docUser = AppDataSource.manager.create(User, {
    email: 'doc@demo.com',
    passwordHash: await bcrypt.hash('doc123', 10),
    role: UserRole.DOCTOR,
    firstName: 'John',
    lastName: 'Doe',
    status: UserStatus.ACTIVE, // <-- CORRECTO
  });

  // Crear usuario paciente
  const patUser = AppDataSource.manager.create(User, {
    email: 'pat@demo.com',
    passwordHash: await bcrypt.hash('pat123', 10),
    role: UserRole.PATIENT,
    firstName: 'Jane',
    lastName: 'Smith',
    status: UserStatus.ACTIVE, // <-- CORRECTO
  });

  await AppDataSource.manager.save([admin, docUser, patUser]);
  // ...resto del seed...
}

seed();