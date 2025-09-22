import React from 'react';
import { useForm } from 'react-hook-form';
import { patientSchema, PatientFormValues } from '../../validators/patient.schema';
import { yupResolver } from '@hookform/resolvers/yup';

interface PatientFormProps {
  defaultValues?: Partial<PatientFormValues>;
  onSubmit: (data: PatientFormValues) => void | Promise<void>;
  submitting?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  defaultValues,
  onSubmit,
  submitting,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormValues>({
    resolver: yupResolver(patientSchema),
    defaultValues,
    mode: 'onBlur'
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-root">
      <div className="form-group">
        <label>Nombre</label>
        <input {...register('firstName')} className={errors.firstName ? 'error' : ''} />
        {errors.firstName && <small>{errors.firstName.message}</small>}
      </div>
      <div className="form-group">
        <label>Apellido</label>
        <input {...register('lastName')} className={errors.lastName ? 'error' : ''} />
        {errors.lastName && <small>{errors.lastName.message}</small>}
      </div>
      <div className="form-group">
        <label>Email</label>
        <input {...register('email')} className={errors.email ? 'error' : ''} />
        {errors.email && <small>{errors.email.message}</small>}
      </div>
      <div className="form-group">
        <label>Fecha Nacimiento</label>
        <input type="date" {...register('birthDate')} />
        {errors.birthDate && <small>{errors.birthDate.message}</small>}
      </div>
      <button type="submit" disabled={submitting}>Guardar</button>
    </form>
  );
};