import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
});

export default function PatientForm({ onSubmit }: { onSubmit: any }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} placeholder="Nombre" />
      {errors.name && <span>{errors.name.message}</span>}
      <input {...register("email")} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      <input {...register("phone")} placeholder="Teléfono" />
      {errors.phone && <span>{errors.phone.message}</span>}
      <button type="submit">Guardar</button>
    </form>
  );
}