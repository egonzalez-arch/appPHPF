import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup.string().required('Usuario requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña requerida'),
});