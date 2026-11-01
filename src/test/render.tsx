import { render } from '@testing-library/react';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import type { ReactElement } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';

export function renderWithProviders(ui: ReactElement) {
  return render(
    <NuqsTestingAdapter>
      <ThemeProvider>{ui}</ThemeProvider>
    </NuqsTestingAdapter>,
  );
}
