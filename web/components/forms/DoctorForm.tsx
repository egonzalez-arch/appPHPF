import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const DoctorSchema = z.object({
  specialty: z.string().min(2),
  license: z.string().min(2),
  bio: z.string().optional(),
});

type DoctorFormData = z.infer<typeof DoctorSchema>;

export default function DoctorForm({ onSubmit }: { onSubmit: (data: DoctorFormData) => void }) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(DoctorSchema),
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('specialty')} placeholder="Especialidad" />
      <input {...register('license')} placeholder="Licencia" />
      <input {...register('bio')} placeholder="Bio" />
      <button type="submit">Guardar</button>
      {formState.errors && (
        <div className="text-red-500">{JSON.stringify(formState.errors)}</div>
      )}
    </form>
  );
}