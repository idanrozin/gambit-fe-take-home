import { render } from '@testing-library/react';
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing';
import type { ReactElement } from 'react';
import { ApplicationsProvider } from '@/components/ApplicationsProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import type { Application } from '@/domain';

interface RenderOptions {
  /** The initial URL query, e.g. `?provider=AWS`. */
  searchParams?: string;
  onUrlUpdate?: OnUrlUpdateFunction;
  applications?: Application[];
}

export function renderWithProviders(
  ui: ReactElement,
  { searchParams, onUrlUpdate, applications }: RenderOptions = {},
) {
  return render(
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
      <ThemeProvider>
        <ApplicationsProvider initialApplications={applications}>{ui}</ApplicationsProvider>
      </ThemeProvider>
    </NuqsTestingAdapter>,
  );
}
