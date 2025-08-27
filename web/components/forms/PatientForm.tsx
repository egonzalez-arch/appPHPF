import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const PatientSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  birthDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Fecha inválida'),
  sex: z.enum(['M', 'F', 'O']),
  email: z.string().email(),
});

export default function PatientForm({ onSubmit }) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(PatientSchema),
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('firstName')} placeholder="Nombre" />
      <input {...register('lastName')} placeholder="Apellido" />
      <input {...register('birthDate')} type="date" placeholder="Fecha Nacimiento" />
      <select {...register('sex')}>
        <option value="">Sexo</option>
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
        <option value="O">Otro</option>
      </select>
      <input {...register('email')} placeholder="Email" type="email" />
      <button type="submit">Guardar</button>
      {formState.errors && (
        <div className="text-red-500">{JSON.stringify(formState.errors)}</div>
      )}
    </form>
  );
}