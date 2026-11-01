import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { RESOURCES, type Application } from '@/domain';
import { renderWithProviders } from '@/test/render';
import { ApplicationDrawer } from './ApplicationDrawer';
import { ApplicationsSidebar } from './ApplicationsSidebar';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const payments: Application = {
  id: 'a',
  name: 'Payments API',
  description: 'Card payments',
  resourceIds: ['res-01', 'res-02'],
};
const checkout: Application = { id: 'b', name: 'Checkout', resourceIds: ['res-01'] };

function renderApp(searchParams?: string) {
  const onUrlUpdate = vi.fn();
  renderWithProviders(
    <>
      <ApplicationsSidebar />
      <ApplicationDrawer resources={RESOURCES} />
    </>,
    { searchParams, onUrlUpdate, applications: [payments, checkout] },
  );
  return onUrlUpdate;
}

const lastQuery = (onUrlUpdate: ReturnType<typeof vi.fn>) =>
  onUrlUpdate.mock.calls.at(-1)?.[0].queryString;

beforeEach(() => vi.clearAllMocks());

test('clicking a sidebar item opens its drawer, marks it and sets ?app=', async () => {
  const user = userEvent.setup();
  const onUrlUpdate = renderApp();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /^Payments API/ }));
  expect(screen.getByRole('dialog', { name: 'Payments API' })).toBeVisible();
  expect(lastQuery(onUrlUpdate)).toBe('?app=a');
  // The modal drawer hides the sidebar from the accessibility tree.
  const options = { hidden: true };
  expect(screen.getByRole('button', { name: /^Payments API/, ...options })).toHaveAttribute(
    'aria-current',
    'true',
  );
  expect(screen.getByRole('button', { name: /^Checkout/, ...options })).not.toHaveAttribute(
    'aria-current',
  );
});

test('loading a URL with ?app= opens the drawer with the graph', () => {
  renderApp('?app=a');
  expect(screen.getByRole('dialog', { name: 'Payments API' })).toBeVisible();
  const graph = screen.getByRole('group', { name: /Graph of Payments API/ });
  expect(graph).toHaveAccessibleDescription(/Payments API with 2 resources: payments-db/);
  expect(screen.getByText('Card payments · 2 resources')).toBeVisible();
  // The centre node plus one per member, each with its type as well as its colour.
  expect(graph.querySelectorAll('rect')).toHaveLength(3);
  expect(within(graph).getByText('RDS Database')).toBeVisible();
  expect(screen.getByRole('list', { name: 'Criticality legend' })).toHaveTextContent('Critical');
});

test('closing the drawer clears ?app=', async () => {
  const user = userEvent.setup();
  const onUrlUpdate = renderApp('?app=a');
  await user.click(screen.getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(lastQuery(onUrlUpdate)).toBe('');
});

test('an unknown id is dropped from the URL with a toast', async () => {
  const onUrlUpdate = renderApp('?app=nope');
  await waitFor(() => expect(lastQuery(onUrlUpdate)).toBe(''));
  expect(toast.error).toHaveBeenCalledWith("That Application wasn't found.", expect.anything());
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('deleting the open Application from the drawer closes it without a toast', async () => {
  const user = userEvent.setup();
  const onUrlUpdate = renderApp('?app=a');
  const dialog = screen.getByRole('dialog', { name: 'Payments API' });
  await user.click(within(dialog).getByRole('button', { name: 'Delete Payments API' }));
  await user.click(screen.getByRole('button', { name: 'Delete' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(lastQuery(onUrlUpdate)).toBe('');
  expect(toast.error).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: /^Payments API/ })).not.toBeInTheDocument();
});

test('opening a node shows its fields and its other Applications, and dismissing returns focus', async () => {
  const user = userEvent.setup();
  const onUrlUpdate = renderApp('?app=a');
  const node = screen.getByRole('button', { name: /^payments-db, RDS Database/ });
  expect(screen.queryByRole('region')).not.toBeInTheDocument();

  node.focus();
  await user.keyboard('{Enter}');
  const details = screen.getByRole('region', { name: 'payments-db' });
  const resource = RESOURCES.find((r) => r.id === 'res-01')!;
  [resource.type, resource.region, resource.owner, ...resource.tags].forEach((text) =>
    expect(within(details).getByText(text)).toBeVisible(),
  );
  expect(within(details).getByText(String(resource.openIssues))).toBeVisible();
  expect(within(details).getByText('Also in')).toBeVisible();

  await user.click(within(details).getByRole('button', { name: 'Close details' }));
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
  expect(node).toHaveFocus();
  // Focus handed back after dismissing must not leave the graph dimmed.
  expect(
    screen
      .getAllByRole('button', { name: /, (Critical|High|Medium|Low)$/ })
      .map((n) => n.classList.contains('opacity-30')),
  ).toEqual([false, false]);

  // The same details open from the member row; the other Application is one click away.
  await user.click(
    within(screen.getByRole('list', { name: 'Resources' })).getAllByRole('button')[0]!,
  );
  await user.click(screen.getByRole('button', { name: 'Checkout' }));
  expect(lastQuery(onUrlUpdate)).toBe('?app=b');
  expect(screen.getByRole('dialog', { name: 'Checkout' })).toBeVisible();
  expect(screen.queryByRole('region')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Checkout' })).toHaveFocus();
});

test('details hide "Also in" for a resource in no other Application', async () => {
  const user = userEvent.setup();
  renderApp('?app=a');
  await user.click(
    within(screen.getByRole('list', { name: 'Resources' })).getAllByRole('button')[1]!,
  );
  expect(screen.getByRole('region')).toBeVisible();
  expect(screen.queryByText('Also in')).not.toBeInTheDocument();
});

test('hovering a member row highlights its node and dims the rest, and leaving restores', async () => {
  const user = // Radix makes the page outside the dialog inert, which user-event refuses to hover through.
    userEvent.setup({ pointerEventsCheck: 0 });
  renderApp('?app=a');
  const [first, second] = within(screen.getByRole('list', { name: 'Resources' })).getAllByRole(
    'button',
  );
  const nodes = screen.getAllByRole('button', { name: /, (Critical|High|Medium|Low)$/ });
  const opacityOf = (node: HTMLElement) => node.classList.contains('opacity-30');

  await user.hover(first!);
  expect(nodes.map(opacityOf)).toEqual([false, true]);
  fireEvent.mouseLeave(first!);
  expect(nodes.map(opacityOf)).toEqual([false, false]);

  await user.hover(nodes[1]!);
  expect(first).toHaveClass('opacity-50');
  expect(second).not.toHaveClass('opacity-50');
});

test('the header switcher lists every Application and switches the drawer', async () => {
  const user = userEvent.setup();
  const onUrlUpdate = renderApp('?app=a');
  await user.click(screen.getByRole('button', { name: 'Switch Application' }));
  const list = screen.getByRole('list', { name: 'Applications' });
  expect(within(list).getAllByRole('button')).toHaveLength(2);
  expect(within(list).getByRole('button', { name: /^Payments API/ })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await user.click(within(list).getByRole('button', { name: /^Checkout/ }));
  expect(lastQuery(onUrlUpdate)).toBe('?app=b');
  expect(screen.getByRole('dialog', { name: 'Checkout' })).toBeVisible();
});
