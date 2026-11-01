import { render } from '@testing-library/react';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import type { ReactElement } from 'react';
import { ApplicationsProvider } from '@/components/ApplicationsProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

interface RenderOptions {
  /** The initial URL query, e.g. `?provider=AWS`. */
  searchParams?: string;
  onUrlUpdate?: OnUrlUpdateFunction;
}

export function renderWithProviders(
  ui: ReactElement,
  { searchParams, onUrlUpdate }: RenderOptions = {},
) {
  return render(
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
      <ThemeProvider>
        <ApplicationsProvider>{ui}</ApplicationsProvider>
      </ThemeProvider>
    </NuqsTestingAdapter>,
  );
}
