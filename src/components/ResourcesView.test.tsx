import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RESOURCES } from '@/domain';
import { renderWithProviders } from '@/test/render';
import { ResourcesView } from './ResourcesView';

const rowNames = () =>
  screen
    .queryAllByRole('row')
    .slice(1)
    .map((row) => row.querySelector('td:nth-of-type(2)')!.textContent);

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

test('selection survives a filter that hides a row, and the bar counts what is hidden', async () => {
  const user = userEvent.setup();
  renderWithProviders(<ResourcesView resources={RESOURCES} />);
  expect(screen.queryByRole('region', { name: 'Selection' })).not.toBeInTheDocument();

  const hidden = RESOURCES.find((r) => !r.name.includes('payments'))!;
  const shown = RESOURCES.find((r) => r.name.includes('payments'))!;
  await user.click(screen.getByRole('checkbox', { name: `Select ${hidden.name}` }));
  await user.click(screen.getByRole('checkbox', { name: `Select ${shown.name}` }));
  expect(screen.getByText('2 selected')).toBeVisible();

  await user.type(screen.getByRole('searchbox', { name: /search/i }), 'payments');
  const bar = screen.getByRole('region', { name: 'Selection' });
  expect(bar).toHaveTextContent('2 selected (1 hidden)');
  expect(screen.getByRole('checkbox', { name: `Select ${shown.name}` })).toBeChecked();

  await user.clear(screen.getByRole('searchbox', { name: /search/i }));
  expect(screen.getByRole('checkbox', { name: `Select ${hidden.name}` })).toBeChecked();
});

test('the header checkbox acts on visible rows only and shows a mixed state', async () => {
  const user = userEvent.setup();
  renderWithProviders(<ResourcesView resources={RESOURCES} />, { searchParams: '?provider=AWS' });
  const aws = RESOURCES.filter((r) => r.provider === 'AWS');
  const header = () => screen.getByRole('checkbox', { name: 'Select all visible resources' });

  await user.click(screen.getByRole('checkbox', { name: `Select ${aws[0]!.name}` }));
  expect(header()).toBePartiallyChecked();

  await user.click(header());
  expect(header()).toBeChecked();
  expect(screen.getByRole('region', { name: 'Selection' })).toHaveTextContent(
    `${aws.length} selected`,
  );

  await user.click(header());
  expect(header()).not.toBeChecked();
  expect(screen.queryByRole('region', { name: 'Selection' })).not.toBeInTheDocument();
});

test('clear selection empties it and removes the bar', async () => {
  const user = userEvent.setup();
  renderWithProviders(<ResourcesView resources={RESOURCES} />);
  await user.click(screen.getByRole('checkbox', { name: `Select ${RESOURCES[0]!.name}` }));
  await user.click(screen.getByRole('button', { name: 'Clear selection' }));
  expect(screen.queryByRole('region', { name: 'Selection' })).not.toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: `Select ${RESOURCES[0]!.name}` })).not.toBeChecked();
});

test('create is disabled until a parent handles it, then passes the selected ids', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  const { unmount } = renderWithProviders(<ResourcesView resources={RESOURCES} />);
  await user.click(screen.getByRole('checkbox', { name: `Select ${RESOURCES[0]!.name}` }));
  expect(screen.getByRole('button', { name: 'Create Application' })).toBeDisabled();
  unmount();

  renderWithProviders(<ResourcesView resources={RESOURCES} onCreateApplication={onCreate} />);
  await user.click(screen.getByRole('checkbox', { name: `Select ${RESOURCES[0]!.name}` }));
  await user.click(screen.getByRole('button', { name: 'Create Application' }));
  expect(onCreate).toHaveBeenCalledWith([RESOURCES[0]!.id]);
});
