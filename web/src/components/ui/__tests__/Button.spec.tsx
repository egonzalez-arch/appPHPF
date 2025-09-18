import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

test('render button', () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Enviar</Button>);
  fireEvent.click(screen.getByText(/Enviar/));
  expect(onClick).toHaveBeenCalled();
});