import { useEffect } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { useApplicationActions } from './ApplicationsProvider';
import { ApplicationsSidebar } from './ApplicationsSidebar';

function Seed() {
  const { create } = useApplicationActions();
  useEffect(() => {
    create({ id: 'a', name: 'Payments API', resourceIds: ['r1'] });
    create({ id: 'b', name: 'Checkout', resourceIds: ['r1', 'r2'] });
  }, [create]);
  return null;
}

const renderSidebar = () =>
  renderWithProviders(
    <>
      <Seed />
      <ApplicationsSidebar />
    </>,
  );

test('cancelling the delete leaves the Application and returns focus to the trigger', async () => {
  const user = userEvent.setup();
  renderSidebar();
  const trigger = screen.getByRole('button', { name: 'Delete Payments API' });
  await user.click(trigger);
  const dialog = screen.getByRole('alertdialog', { name: 'Delete Payments API?' });
  expect(dialog).toHaveTextContent("resources aren't affected");
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  expect(screen.getByText('Payments API')).toBeVisible();
  expect(trigger).toHaveFocus();
});

test('confirming the delete removes only that Application', async () => {
  const user = userEvent.setup();
  renderSidebar();
  await user.click(screen.getByRole('button', { name: 'Delete Payments API' }));
  await user.click(screen.getByRole('button', { name: 'Delete' }));
  expect(screen.queryByText('Payments API')).not.toBeInTheDocument();
  expect(screen.getByText('Checkout')).toBeVisible();
});

test('deleting the last Application shows the empty state', async () => {
  const user = userEvent.setup();
  renderSidebar();
  for (const name of ['Checkout', 'Payments API']) {
    await user.click(screen.getByRole('button', { name: `Delete ${name}` }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
  }
  expect(screen.getByText('No Applications yet')).toBeVisible();
});
