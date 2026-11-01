import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';
import {
  Badge,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  CRITICALITY_LABELS,
  applicationsContaining,
  ENVIRONMENT_LABELS,
  PROVIDER_LABELS,
  sortResources,
  toggleSort,
  visibleSelectionState,
  type Application,
  type Resource,
  type SortKey,
  type SortState,
} from '@/domain';
import { MembershipHint } from '@/components/MembershipHint';
import { cn } from '@/lib/utils';

// Below `md` these fold into a line under the name, so the table fits without sideways scrolling.
const DETAIL_COLUMN = 'hidden md:table-cell';

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;

function SortableHead({
  sortKey,
  sort,
  onSort,
  align = 'left',
  children,
}: {
  sortKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'center';
  children: string;
}) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDownIcon : sort.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon;

  return (
    <TableHead aria-sort={active ? ARIA_SORT[sort.direction] : 'none'}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'inline-flex items-center gap-1 rounded-sm font-medium pointer-coarse:min-h-11 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          align === 'center' && 'w-full justify-center',
        )}
      >
        {children}
        <Icon className={cn('size-3.5', !active && 'text-muted-foreground/60')} aria-hidden />
      </button>
    </TableHead>
  );
}

interface ResourcesTableProps {
  resources: Resource[];
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  /** Select or deselect every row in `resources`, the visible ones. */
  onToggleAll: (checked: boolean) => void;
  /** Every Application, to show which ones each resource belongs to. */
  applications: Application[];
  onOpenApplication: (id: string) => void;
}

export function ResourcesTable({
  resources,
  sort,
  onSortChange,
  selected,
  onToggle,
  onToggleAll,
  applications,
  onOpenApplication,
}: ResourcesTableProps) {
  const rows = sortResources(resources, sort);
  const onSort = (key: SortKey) => onSortChange(toggleSort(sort, key));
  const selection = visibleSelectionState(selected, resources);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              aria-label="Select all visible resources"
              checked={selection === 'all' ? true : selection === 'some' ? 'indeterminate' : false}
              onCheckedChange={(checked) => onToggleAll(checked === true)}
            />
          </TableHead>
          <SortableHead sortKey="name" sort={sort} onSort={onSort}>
            Name
          </SortableHead>
          <TableHead className={DETAIL_COLUMN}>Type</TableHead>
          <TableHead className={DETAIL_COLUMN}>Provider</TableHead>
          <TableHead className={DETAIL_COLUMN}>Environment</TableHead>
          <SortableHead sortKey="criticality" sort={sort} onSort={onSort}>
            Criticality
          </SortableHead>
          <SortableHead sortKey="openIssues" sort={sort} onSort={onSort} align="center">
            Open issues
          </SortableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((resource) => (
          <TableRow
            key={resource.id}
            data-state={selected.has(resource.id) ? 'selected' : undefined}
            className="cursor-pointer"
            onClick={(event) => {
              // Controls toggle or open things themselves, and portalled popover content bubbles
              // through React but is not inside the row.
              const target = event.target as Element;
              if (!event.currentTarget.contains(target)) return;
              if (target.closest('button, a, input, [role="checkbox"]')) return;
              onToggle(resource.id);
            }}
          >
            <TableCell>
              <Checkbox
                aria-label={`Select ${resource.name}`}
                checked={selected.has(resource.id)}
                onCheckedChange={() => onToggle(resource.id)}
              />
            </TableCell>
            <TableCell className="font-medium">
              <span data-slot="resource-name">{resource.name}</span>
              <MembershipHint
                resourceName={resource.name}
                applications={applicationsContaining(resource.id, applications)}
                onOpenApplication={onOpenApplication}
              />
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground md:hidden">
                {[
                  resource.type,
                  PROVIDER_LABELS[resource.provider],
                  ENVIRONMENT_LABELS[resource.environment],
                ].join(' · ')}
              </span>
            </TableCell>
            <TableCell className={DETAIL_COLUMN}>{resource.type}</TableCell>
            <TableCell className={DETAIL_COLUMN}>{PROVIDER_LABELS[resource.provider]}</TableCell>
            <TableCell className={DETAIL_COLUMN}>
              {ENVIRONMENT_LABELS[resource.environment]}
            </TableCell>
            <TableCell>
              <Badge variant={resource.criticality}>
                {CRITICALITY_LABELS[resource.criticality]}
              </Badge>
            </TableCell>
            <TableCell className="text-center tabular-nums">{resource.openIssues}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
