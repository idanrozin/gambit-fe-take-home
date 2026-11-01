import type { ReactNode } from 'react';
import type { Criticality } from '@/domain';
import { cn } from '@/lib/utils';

type Variant = Criticality | 'neutral';

// Colour is never the only signal: the label text is always rendered.
const styles: Record<Variant, string> = {
  critical: 'bg-red-100 text-red-800 ring-red-300',
  high: 'bg-orange-100 text-orange-800 ring-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 ring-yellow-300',
  low: 'bg-blue-100 text-blue-800 ring-blue-300',
  neutral: 'bg-muted text-muted-foreground ring-border',
};

export function Badge({
  variant = 'neutral',
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
        styles[variant],
      )}
    >
      {children}
    </span>
  );
}
