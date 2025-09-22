import * as yup from 'yup';

export const patientSchema = yup.object({
  firstName: yup.string().min(2).max(80).required(),
  lastName: yup.string().min(2).max(80).required(),
  email: yup.string().email().required(),
  birthDate: yup.date().nullable().notRequired(),
});