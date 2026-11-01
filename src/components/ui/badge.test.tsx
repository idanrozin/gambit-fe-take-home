import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

it('renders its label (not colour-only)', () => {
  render(<Badge variant="critical">Critical</Badge>);
  expect(screen.getByText('Critical')).toBeInTheDocument();
});
