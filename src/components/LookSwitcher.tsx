import { useState } from 'react';
import { applyLook, LOOKS, readStoredLook, type Look } from '@/lib/look';

// POC only: lets reviewers flip between design directions.
export function LookSwitcher() {
  const [look, setLook] = useState<Look>(readStoredLook);

  return (
    <div role="group" aria-label="Look" className="flex rounded-lg border p-0.5 text-xs">
      {LOOKS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={look === value}
          onClick={() => {
            setLook(value);
            applyLook(value);
          }}
          className="rounded-md px-2 py-1 font-medium text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-secondary aria-pressed:text-secondary-foreground"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
