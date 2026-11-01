import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { DEFAULT_SORT, RESOURCES, type SortState } from '@/domain';
import { ResourcesTable } from './ResourcesTable';

function Harness() {
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  return (
    <ResourcesTable
      resources={RESOURCES}
      sort={sort}
      onSortChange={setSort}
      selected={new Set()}
      onToggle={() => {}}
      onToggleAll={() => {}}
      applications={[]}
      onOpenApplication={() => {}}
    />
  );
}

const firstRowName = () => {
  const [firstRow] = screen.getAllByRole('row').slice(1);
  return within(firstRow!).getAllByRole('cell')[1]!.querySelector('[data-slot="resource-name"]')!
    .textContent;
};

test('shows the six columns and one row per resource', () => {
  render(<Harness />);
  for (const name of ['Name', 'Type', 'Provider', 'Environment', 'Criticality', 'Open issues']) {
    expect(screen.getByRole('columnheader', { name })).toBeInTheDocument();
  }
  expect(screen.getAllByRole('row')).toHaveLength(RESOURCES.length + 1);
});

test('starts with the riskiest resource first and exposes the sort on the header', () => {
  render(<Harness />);
  expect(firstRowName()).toBe('payments-db');
  expect(screen.getByRole('columnheader', { name: 'Criticality' })).toHaveAttribute(
    'aria-sort',
    'descending',
  );
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('aria-sort', 'none');
});

test('clicking a sortable header sorts by it and toggles the direction', async () => {
  const user = userEvent.setup();
  render(<Harness />);

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

test('clicking a row toggles it like its checkbox, without double-toggling the checkbox itself', async () => {
  const user = userEvent.setup();
  const onToggle = vi.fn();
  render(
    <ResourcesTable
      resources={RESOURCES}
      sort={DEFAULT_SORT}
      onSortChange={() => {}}
      selected={new Set()}
      onToggle={onToggle}
      onToggleAll={() => {}}
      applications={[]}
      onOpenApplication={() => {}}
    />,
  );
  const [firstRow] = screen.getAllByRole('row').slice(1);
  const id = RESOURCES.find(
    (r) =>
      r.name ===
      within(firstRow!).getByText(/./, { selector: '[data-slot="resource-name"]' }).textContent,
  )!.id;

  await user.click(within(firstRow!).getAllByRole('cell')[2]!);
  expect(onToggle).toHaveBeenCalledExactlyOnceWith(id);

  onToggle.mockClear();
  await user.click(within(firstRow!).getByRole('checkbox'));
  expect(onToggle).toHaveBeenCalledExactlyOnceWith(id);
});
