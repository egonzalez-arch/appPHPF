// Tipos base para el sistema

export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'GUEST';

// Ejemplo de uso
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: string;
  // ...otros campos
}