import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createDoctorWithUser,
  CreateDoctorWithUserInput,
  DoctorEntity,
} from '@/lib/api/api.doctors';
import { doctorsKeys } from './useDoctor'; // Asegúrate de exportar doctorsKeys desde el otro hook.

export function useCreateDoctorWithUser() {
  const qc = useQueryClient();

  return useMutation<DoctorEntity, Error, CreateDoctorWithUserInput>({
    mutationFn: createDoctorWithUser,
    onSuccess: (created) => {
      // 1. Inserción inmediata (feedback instantáneo)
      qc.setQueryData<DoctorEntity[] | undefined>(doctorsKeys.list(), (prev) =>
        prev ? [created, ...prev] : [created],
      );

      // 2. Invalidar para sincronizar (se hace en micro-tick para que el setQueryData no sea “pisado”)
      queueMicrotask(() => {
        qc.invalidateQueries({ queryKey: doctorsKeys.list(), refetchType: 'active' });
      });
    },
  });
}