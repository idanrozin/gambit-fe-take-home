import { screen } from '@testing-library/react';
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
