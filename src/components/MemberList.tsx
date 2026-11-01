import { useId } from 'react';
import type { Focusable } from '@/components/ApplicationGraph';
import { Badge } from '@/components/ui';
import { CRITICALITY_LABELS, type Resource } from '@/domain';
import { cn } from '@/lib/utils';

interface MemberListProps {
  members: Resource[];
  highlightedId: string | null;
  selectedId: string | null;
  onHighlight: (resourceId: string | null) => void;
  /** `trigger` is the element to give focus back to when the details are dismissed. */
  onSelect: (resourceId: string, trigger: Focusable) => void;
}

/**
 * The Application's resources as rows that mirror the graph's nodes. Each resource is a tab
 * stop twice, as a node and as a row: the list is the accessible, scannable twin of the graph.
 */
export function MemberList({
  members,
  highlightedId,
  selectedId,
  onHighlight,
  onSelect,
}: MemberListProps) {
  const headingId = useId();
  return (
    <section>
      <h3 className="sticky top-0 z-10 flex items-baseline justify-between bg-popover px-1.5 pb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <span id={headingId}>Resources</span>
        <span className="font-normal tabular-nums">{members.length}</span>
      </h3>
      <ul aria-labelledby={headingId} className="space-y-1.5 p-1">
        {members.map((member) => {
          const dimmed = highlightedId !== null && highlightedId !== member.id;
          return (
            <li key={member.id}>
              <button
                type="button"
                aria-pressed={selectedId === member.id}
                onClick={(event) => onSelect(member.id, event.currentTarget)}
                onMouseEnter={() => onHighlight(member.id)}
                onMouseLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(member.id)}
                onBlur={() => onHighlight(null)}
                className={cn(
                  'flex w-full flex-col items-start gap-1 rounded-lg border bg-card px-3 py-2 text-left transition-opacity outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-ring',
                  dimmed && 'opacity-50',
                )}
              >
                <span className="max-w-full truncate text-sm font-medium">{member.name}</span>
                <span className="flex max-w-full items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{member.type}</span>
                  <Badge variant={member.criticality}>
                    {CRITICALITY_LABELS[member.criticality]}
                  </Badge>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
