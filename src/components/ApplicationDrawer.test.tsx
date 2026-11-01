import { screen, waitFor, within } from '@testing-library/react';
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
  const graph = screen.getByRole('img', { name: /Graph of Payments API/ });
  expect(graph).toHaveAccessibleDescription(/Payments API with 2 resources: payments-db/);
  expect(screen.getByText('Card payments · 2 resources')).toBeVisible();
  // The centre node plus one per member, each with its type as well as its colour.
  expect(graph.querySelectorAll('rect')).toHaveLength(3);
  expect(screen.getByText('RDS Database')).toBeVisible();
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
