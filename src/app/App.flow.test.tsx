import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { App } from './App';

beforeEach(() => localStorage.clear());

test('filter, select, create an Application, then open its graph', async () => {
  const user = userEvent.setup();
  renderWithProviders(<App />);

  // Narrow to AWS resources. (Combined filters are covered in ResourcesView.test.tsx; the nuqs
  // testing adapter can't chain two UI-driven URL writes.)
  await user.click(screen.getByRole('button', { name: /^Provider filter/ }));
  await user.click(screen.getByRole('checkbox', { name: 'AWS' }));
  await user.keyboard('{Escape}');
  expect(await screen.findByText('5 of 12 resources')).toBeVisible();
  expect(screen.queryByRole('checkbox', { name: 'Select data-lake' })).not.toBeInTheDocument();

  // Select two of the visible rows and create an Application from them.
  await user.click(screen.getByRole('checkbox', { name: 'Select payments-db' }));
  await user.click(screen.getByRole('checkbox', { name: 'Select payments-api-gateway' }));
  await user.click(screen.getByRole('button', { name: 'Create Application' }));
  const sheet = screen.getByRole('dialog', { name: 'Create Application' });
  await user.type(within(sheet).getByRole('textbox', { name: 'Name' }), 'Payments API');
  await user.click(within(sheet).getByRole('button', { name: 'Create Application' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  // It appears in the sidebar, and the selection is cleared.
  const sidebar = screen.getByRole('complementary', { name: 'Applications' });
  expect(within(sidebar).getByText('2 resources')).toBeVisible();
  expect(screen.queryByText(/selected/)).not.toBeInTheDocument();

  // Opening it shows the graph with one node per member.
  await user.click(within(sidebar).getByRole('button', { name: /^Payments API/ }));
  const drawer = await screen.findByRole('dialog', { name: 'Payments API' });
  const graph = within(drawer).getByRole('group', { name: /Graph of Payments API/ });
  expect(graph).toHaveAccessibleDescription(
    /2 resources: payments-db \(Critical\), payments-api-gateway \(Critical\)/,
  );
  expect(within(graph).getByRole('button', { name: /^payments-db, RDS Database/ })).toBeVisible();
  expect(
    within(graph).getByRole('button', { name: /^payments-api-gateway, API Gateway/ }),
  ).toBeVisible();
});
