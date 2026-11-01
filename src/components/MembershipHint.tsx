import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import type { Application } from '@/domain';

interface MembershipHintProps {
  resourceName: string;
  /** The Applications that include the resource; renders nothing when empty. */
  applications: Application[];
  onOpenApplication: (id: string) => void;
}

/** "in N apps" next to a resource; opens a list of those Applications to jump to. */
export function MembershipHint({
  resourceName,
  applications,
  onOpenApplication,
}: MembershipHintProps) {
  const [open, setOpen] = useState(false);
  if (applications.length === 0) return null;

  const count = applications.length;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={`${resourceName} is in ${count} ${count === 1 ? 'Application' : 'Applications'}`}
        className="ml-2 cursor-pointer rounded-sm text-xs font-normal text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        in {count} {count === 1 ? 'app' : 'apps'}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 gap-1">
        <p className="px-1.5 text-xs text-muted-foreground">
          Applications containing this resource
        </p>
        <ul>
          {applications.map(({ id, name }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenApplication(id);
                }}
                className="w-full cursor-pointer truncate rounded-sm px-1.5 py-1 text-left hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
