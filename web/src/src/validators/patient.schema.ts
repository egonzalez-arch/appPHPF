import * as yup from 'yup';

export const patientSchema = yup.object({
  firstName: yup.string().min(2).max(60).required(),
  lastName: yup.string().min(2).max(60).required(),
  email: yup.string().email().required(),
  birthDate: yup.date().nullable(),
});