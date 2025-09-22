import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { patientSchema } from '@/forms/validators/patientSchema';

interface PatientFormValues {
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
}

export const PatientForm: React.FC<{ onSubmit: (v: PatientFormValues)=>void }> = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PatientFormValues>({
    resolver: yupResolver(patientSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} placeholder="Nombre" />
      {errors.firstName && <span>{errors.firstName.message}</span>}
      <input {...register('lastName')} placeholder="Apellido" />
      {errors.lastName && <span>{errors.lastName.message}</span>}
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="date" {...register('birthDate')} />
      <button disabled={isSubmitting} type="submit">Guardar</button>
    </form>
  );
};