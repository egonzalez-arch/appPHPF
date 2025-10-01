import { useMutation } from '@tanstack/react-query';
import { createDoctorWithUser, NewDoctorCompositeInput } from '@/lib/api/createDoctorWithUser';
import { Doctor } from '@/lib/api/api';

export function useCreateDoctorWithUser() {
  return useMutation<Doctor, Error, NewDoctorCompositeInput>({
    mutationFn: createDoctorWithUser,
  });
}