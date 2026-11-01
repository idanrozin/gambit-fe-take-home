import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RESOURCES } from '@/domain';
import { renderWithProviders } from '@/test/render';
import { ResourcesView } from './ResourcesView';

const rowNames = () =>
  screen
    .queryAllByRole('row')
    .slice(1)
    .map((row) => row.querySelector('td')!.textContent);

test('renders the view filtered by the URL, with a count and a way to clear', () => {
  renderWithProviders(<ResourcesView resources={RESOURCES} />, {
    searchParams: '?q=PAYMENTS&provider=AWS&env=production',
  });
  const expected = RESOURCES.filter(
    (r) => r.name.includes('payments') && r.provider === 'AWS' && r.environment === 'production',
  );
  expect(rowNames()).toHaveLength(expected.length);
  expect(rowNames().every((name) => name?.includes('payments'))).toBe(true);
  expect(screen.getByText(`${expected.length} of ${RESOURCES.length} resources`)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Clear filters' })).toBeVisible();
});

test('ignores invalid param values instead of crashing', () => {
  renderWithProviders(<ResourcesView resources={RESOURCES} />, {
    searchParams: '?provider=Oracle&criticality=urgent,high&env=',
  });
  const high = RESOURCES.filter((r) => r.criticality === 'high');
  expect(rowNames()).toHaveLength(high.length);
});

test('shows no count or clear action while nothing is active', () => {
  renderWithProviders(<ResourcesView resources={RESOURCES} />);
  expect(rowNames()).toHaveLength(RESOURCES.length);
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
});

test('typing narrows rows at once and writes the URL after the debounce', async () => {
  const user = userEvent.setup();
  const onUrlUpdate = vi.fn();
  renderWithProviders(<ResourcesView resources={RESOURCES} />, { onUrlUpdate });

  await user.type(screen.getByRole('searchbox', { name: /search/i }), 'payments-db');
  expect(rowNames()).toEqual(['payments-db']);
  expect(onUrlUpdate).not.toHaveBeenCalled();

  await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
  expect(onUrlUpdate.mock.lastCall![0].searchParams.get('q')).toBe('payments-db');
});

test('a search with no match shows the empty state, and clearing restores every row', async () => {
  const user = userEvent.setup();
  renderWithProviders(<ResourcesView resources={RESOURCES} />, { searchParams: '?q=zzz' });

  expect(screen.getByRole('heading', { name: 'No resources match' })).toBeVisible();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();

  const [, emptyStateClear] = screen.getAllByRole('button', { name: 'Clear filters' });
  await user.click(emptyStateClear!);
  expect(rowNames()).toHaveLength(RESOURCES.length);
});

test('keeps the chosen sort across an empty result', async () => {
  const user = userEvent.setup();
  renderWithProviders(<ResourcesView resources={RESOURCES} />, { searchParams: '?q=zzz' });
  await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[1]!);

  await user.click(screen.getByRole('button', { name: 'Name' }));
  await user.type(screen.getByRole('searchbox'), 'zzz');
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  await user.clear(screen.getByRole('searchbox'));

  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
    'aria-sort',
    'ascending',
  );
});

test('keeps the chosen sort after a no-match search unmounts the table', async () => {
  const user = userEvent.setup();
  renderWithProviders(<ResourcesView resources={RESOURCES} />);

  await user.click(screen.getByRole('button', { name: 'Name' }));
  const sortedByName = rowNames();

  const search = screen.getByRole('searchbox', { name: /search/i });
  await user.type(search, 'zzz');
  expect(screen.queryByRole('table')).not.toBeInTheDocument();

  await user.clear(search);
  expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
    'aria-sort',
    'ascending',
  );
  expect(rowNames()).toEqual(sortedByName);
});
