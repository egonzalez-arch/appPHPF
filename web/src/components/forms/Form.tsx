import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

type FormProps<T> = {
  schema: any;
  defaultValues?: T;
  onSubmit: SubmitHandler<T>;
  children: (form: ReturnType<typeof useForm<T>>) => React.ReactNode;
};

export function Form<T>({ schema, defaultValues, onSubmit, children }: FormProps<T>) {
  const methods = useForm<T>({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      {children(methods)}
    </form>
  );
}