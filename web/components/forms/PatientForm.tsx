'use client';
import { useForm } from 'react-hook-form';
//import { Patient } from '@/lib/api/api';

export interface PatientFormValues {
  birthDate: string;
  PatientSex: string;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  // Puedes agregar aquí más campos según tu modelo Patient
}

export interface PatientFormProps {
  initialValues?: Partial<PatientFormValues>;
  onSubmit: (data: PatientFormValues) => void;
  onCancel: () => void;
  error?: Error | null;
  isLoading?: boolean;
}

export default function PatientForm({
  initialValues,
  onSubmit,
  onCancel,
  error,
  isLoading,
}: PatientFormProps) {
  const { register, handleSubmit, formState } = useForm<PatientFormValues>({
    defaultValues: initialValues || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Fecha de nacimiento */}
      <div>
        <label className="block text-sm mb-1">Fecha de nacimiento</label>
        <input
          {...register('birthDate', { required: 'Fecha de nacimiento requerida' })}
          className="border rounded px-2 py-1 w-full"
          type="date"
        />
        {formState.errors?.birthDate && (
          <div className="text-red-500 text-xs">{formState.errors.birthDate.message}</div>
        )}
      </div>

      {/* Sexo */}
      <div>
        <label className="block text-sm mb-1">Sexo</label>
        <select
          {...register('PatientSex', { required: 'Sexo requerido' })}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="">Selecciona sexo</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
          <option value="O">Otro</option>
        </select>
        {formState.errors?.PatientSex && (
          <div className="text-red-500 text-xs">{formState.errors.PatientSex.message}</div>
        )}
      </div>

      {/* Tipo de sangre */}
      <div>
        <label className="block text-sm mb-1">Tipo de sangre</label>
        <select
          {...register('bloodType')}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="">Selecciona tipo</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
        {formState.errors?.bloodType && (
          <div className="text-red-500 text-xs">{formState.errors.bloodType.message}</div>
        )}
      </div>

      {/* Alergias */}
      <div>
        <label className="block text-sm mb-1">Alergias</label>
        <input
          {...register('allergies')}
          className="border rounded px-2 py-1 w-full"
          autoComplete="off"
        />
        {formState.errors?.allergies && (
          <div className="text-red-500 text-xs">{formState.errors.allergies.message}</div>
        )}
      </div>

      {/* Contacto de emergencia */}
      <div>
        <label className="block text-sm mb-1">Contacto de emergencia</label>
        <input
          {...register('emergencyContact')}
          className="border rounded px-2 py-1 w-full"
          autoComplete="off"
        />
        {formState.errors?.emergencyContact && (
          <div className="text-red-500 text-xs">{formState.errors.emergencyContact.message}</div>
        )}
      </div>

      {/* Mensaje de error de la mutación */}
      {error && (
        <div className="text-red-500 my-2 text-sm">
          {error.message}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className={`bg-teal-600 text-white px-4 py-2 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded"
          disabled={isLoading}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}