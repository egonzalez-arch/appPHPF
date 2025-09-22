import * as yup from 'yup';

export const patientSchema = yup.object({
  firstName: yup.string().required().min(2).max(60),
  lastName: yup.string().required().min(2).max(60),
  email: yup.string().email().required(),
  birthDate: yup.date().nullable().typeError('Fecha inválida'),
});
export type PatientFormValues = yup.InferType<typeof patientSchema>;