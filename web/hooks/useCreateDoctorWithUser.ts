import { useMutation } from '@tanstack/react-query';
import { createDoctorWithUser, NewDoctorCompositeInput } from '@/lib/api/createDoctorWithUser';
import { Doctor } from '@/lib/api/api';

/**
 * Hook para crear doctor + usuario (igual que useCreatePatientWithUser).
 * Proporciona estado de carga, error y función mutate.
 */
export function useCreateDoctorWithUser() {
  return useMutation<Doctor, Error, NewDoctorCompositeInput>({
    mutationFn: createDoctorWithUser,
  });
}