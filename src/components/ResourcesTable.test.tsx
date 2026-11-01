import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RESOURCES } from '@/domain';
import { ResourcesTable } from './ResourcesTable';

const firstRowName = () => {
  const [firstRow] = screen.getAllByRole('row').slice(1);
  return within(firstRow!).getAllByRole('cell')[0]!.textContent;
};

test('shows the six columns and one row per resource', () => {
  render(<ResourcesTable resources={RESOURCES} />);
  for (const name of ['Name', 'Type', 'Provider', 'Environment', 'Criticality', 'Open issues']) {
    expect(screen.getByRole('columnheader', { name })).toBeInTheDocument();
  }
  expect(screen.getAllByRole('row')).toHaveLength(RESOURCES.length + 1);
});

test('starts with the riskiest resource first and exposes the sort on the header', () => {
  render(<ResourcesTable resources={RESOURCES} />);
  expect(firstRowName()).toBe('payments-db');
  expect(screen.getByRole('columnheader', { name: 'Criticality' })).toHaveAttribute(
    'aria-sort',
    'descending',
  );
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'none');
});

test('clicking a sortable header sorts by it and toggles the direction', async () => {
  const user = userEvent.setup();
  render(<ResourcesTable resources={RESOURCES} />);

  await user.click(screen.getByRole('button', { name: 'Name' }));
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
    'aria-sort',
    'ascending',
  );
  expect(firstRowName()).toBe('data-lake');

  await user.click(screen.getByRole('button', { name: 'Name' }));
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
    'aria-sort',
    'descending',
  );
  expect(firstRowName()).toBe('platform-deploy-role');
});

test('criticality is shown as a labelled badge', () => {
  render(<ResourcesTable resources={RESOURCES} />);
  expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
});
