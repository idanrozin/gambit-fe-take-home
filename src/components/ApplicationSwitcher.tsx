import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useState } from 'react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import type { Application } from '@/domain';
import { cn } from '@/lib/utils';

interface ApplicationSwitcherProps {
  applications: Application[];
  currentId: string;
  onSwitch: (id: string) => void;
}

/** Jumps the open drawer to another Application. Nothing to switch to when there is only one. */
export function ApplicationSwitcher({
  applications,
  currentId,
  onSwitch,
}: ApplicationSwitcherProps) {
  const [open, setOpen] = useState(false);
  if (applications.length < 2) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Switch Application
          <ChevronsUpDownIcon aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-72 w-64 overflow-y-auto scrollbar-subtle">
        <ul aria-label="Applications" className="space-y-0.5">
          {applications.map((application) => {
            const current = application.id === currentId;
            return (
              <li key={application.id}>
                <button
                  type="button"
                  aria-current={current ? 'true' : undefined}
                  onClick={() => {
                    setOpen(false);
                    if (!current) onSwitch(application.id);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
                    current && 'bg-muted font-medium',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{application.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {application.resourceIds.length}
                  </span>
                  {current && <CheckIcon className="size-4" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
