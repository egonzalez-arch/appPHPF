import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Must be a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Must be a valid email address'),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  document: z.string().optional(),
  sex: z.enum(['M', 'F', 'Other']).optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;