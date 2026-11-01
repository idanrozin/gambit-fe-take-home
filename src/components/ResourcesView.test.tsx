import { screen, waitFor, within } from '@testing-library/react';
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

test('create opens the sheet listing the selected resources', async () => {
  const user = userEvent.setup();
  renderWithProviders(<ResourcesView resources={RESOURCES} />);
  await user.click(screen.getByRole('checkbox', { name: `Select ${RESOURCES[0]!.name}` }));
  await user.click(screen.getByRole('button', { name: 'Create Application' }));
  const dialog = screen.getByRole('dialog', { name: 'Create Application' });
  expect(
    within(dialog).getByRole('button', { name: `Remove ${RESOURCES[0]!.name}` }),
  ).toBeVisible();
});

describe('membership hint', () => {
  const [first, second] = RESOURCES;
  const payments = { id: 'a', name: 'Payments API', resourceIds: [first!.id, second!.id] };
  const checkout = { id: 'b', name: 'Checkout', resourceIds: [first!.id] };
  const hintFor = (name: string) => new RegExp(`^${name} is in \\d+ Application`);

  test('shows nothing for a resource in no Application', () => {
    renderWithProviders(<ResourcesView resources={RESOURCES} />, { applications: [checkout] });
    expect(screen.queryByRole('button', { name: hintFor(second!.name) })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /is in \d+ Application/ })).toHaveLength(1);
  });

  test('shows the count and reveals the Application names', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResourcesView resources={RESOURCES} />, {
      applications: [payments, checkout],
    });
    const hint = screen.getByRole('button', { name: `${first!.name} is in 2 Applications` });
    expect(hint).toHaveTextContent('in 2 apps');
    expect(
      screen.getByRole('button', { name: `${second!.name} is in 1 Application` }),
    ).toHaveTextContent('in 1 app');

    await user.click(hint);
    expect(screen.getByRole('button', { name: 'Payments API' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeVisible();
  });

  test('choosing an Application opens its drawer by keyboard', async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn();
    renderWithProviders(<ResourcesView resources={RESOURCES} />, {
      applications: [payments],
      onUrlUpdate,
    });
    screen.getByRole('button', { name: hintFor(first!.name) }).focus();
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('button', { name: 'Payments API' }));
    expect(onUrlUpdate.mock.calls.at(-1)?.[0].queryString).toBe('?app=a');
  });
});
