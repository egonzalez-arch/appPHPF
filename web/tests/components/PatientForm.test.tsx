import { render, screen } from '@testing-library/react';
import { PatientForm } from '@/components/patients/PatientForm';
import userEvent from '@testing-library/user-event';

test('valida campos obligatorios', async () => {
  const onSubmit = jest.fn();
  render(<PatientForm onSubmit={onSubmit} />);
  await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
  expect(await screen.findAllByText(/requerid|required|oblig/i)).toBeTruthy();
});