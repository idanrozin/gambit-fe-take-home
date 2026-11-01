import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { App } from './App';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

test('renders the banner, sidebar and main landmarks with headings', () => {
  renderWithProviders(<App />);
  expect(screen.getByRole('banner')).toBeInTheDocument();
  expect(screen.getByRole('complementary', { name: 'Applications' })).toBeInTheDocument();
  expect(screen.getByRole('main')).toContainElement(
    screen.getByRole('heading', { name: 'Resources' }),
  );
});

test('the sidebar toggle opens and closes the sidebar', async () => {
  const user = userEvent.setup();
  renderWithProviders(<App />);
  const toggle = screen.getByRole('button', { name: 'Applications' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');

  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('the theme toggle applies and persists the choice', async () => {
  const user = userEvent.setup();
  renderWithProviders(<App />);
  expect(screen.getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true');

  await user.click(screen.getByRole('button', { name: 'Dark' }));
  expect(document.documentElement).toHaveClass('dark');
  expect(localStorage.getItem('theme')).toBe('dark');

  await user.click(screen.getByRole('button', { name: 'Light' }));
  expect(document.documentElement).not.toHaveClass('dark');
});

describe('creating an Application', () => {
  async function openSheet(user: ReturnType<typeof userEvent.setup>, count = 2) {
    const boxes = screen.getAllByRole('checkbox').slice(1, 1 + count);
    for (const box of boxes) await user.click(box);
    await user.click(screen.getByRole('button', { name: 'Create Application' }));
    return screen.getByRole('dialog', { name: 'Create Application' });
  }

  test('the sidebar explains how to create one while there are none', () => {
    renderWithProviders(<App />);
    expect(
      within(screen.getByRole('complementary')).getByText(/choose Create Application/),
    ).toBeVisible();
  });

  test('shows an error under each invalid field and clears it once fixed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const dialog = await openSheet(user, 1);

    await user.click(within(dialog).getByRole('button', { name: /^Remove / }));
    await user.click(within(dialog).getByRole('button', { name: 'Create Application' }));
    expect(within(dialog).getByText('Enter a name.')).toBeVisible();
    expect(within(dialog).getByText('Select at least 1 resource.')).toBeVisible();
    expect(within(dialog).getByRole('textbox', { name: 'Name' })).toBeInvalid();

    await user.type(within(dialog).getByRole('textbox', { name: 'Name' }), 'Payments');
    expect(within(dialog).queryByText('Enter a name.')).not.toBeInTheDocument();
    expect(within(dialog).getByText('Select at least 1 resource.')).toBeVisible();
  });

  test('creates the Application, closes the sheet, toasts, clears the selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    const dialog = await openSheet(user, 2);

    await user.type(within(dialog).getByRole('textbox', { name: 'Name' }), '  Payments  ');
    await user.type(within(dialog).getByRole('textbox', { name: /Description/ }), 'Core flow');
    await user.click(within(dialog).getByRole('button', { name: 'Create Application' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const sidebar = screen.getByRole('complementary');
    expect(within(sidebar).getByText('Payments')).toBeVisible();
    expect(within(sidebar).getByText('2 resources')).toBeVisible();
    expect(within(sidebar).getByText('Core flow')).toBeVisible();
    expect(await screen.findByText('Created Payments')).toBeVisible();
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  test('rejects a duplicate name and lists the newest Application first', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    for (const name of ['First', 'Second']) {
      const dialog = await openSheet(user, 1);
      await user.type(within(dialog).getByRole('textbox', { name: 'Name' }), name);
      await user.click(within(dialog).getByRole('button', { name: 'Create Application' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    }
    const items = within(screen.getByRole('complementary')).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Second');
    expect(items[1]).toHaveTextContent('First');

    const dialog = await openSheet(user, 1);
    await user.type(within(dialog).getByRole('textbox', { name: 'Name' }), 'first');
    await user.click(within(dialog).getByRole('button', { name: 'Create Application' }));
    expect(within(dialog).getByText(/already exists/)).toBeVisible();
  });
});
