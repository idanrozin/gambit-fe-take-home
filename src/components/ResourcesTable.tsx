import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  CRITICALITY_LABELS,
  ENVIRONMENT_LABELS,
  PROVIDER_LABELS,
  sortResources,
  toggleSort,
  type Resource,
  type SortKey,
  type SortState,
} from '@/domain';
import { cn } from '@/lib/utils';

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
  align?: 'left' | 'right';
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
          'inline-flex items-center gap-1 rounded-sm font-medium hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          align === 'right' && 'w-full flex-row-reverse',
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
}

export function ResourcesTable({ resources, sort, onSortChange }: ResourcesTableProps) {
  const rows = sortResources(resources, sort);
  const onSort = (key: SortKey) => onSortChange(toggleSort(sort, key));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHead sortKey="name" sort={sort} onSort={onSort}>
            Name
          </SortableHead>
          <TableHead>Type</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Environment</TableHead>
          <SortableHead sortKey="criticality" sort={sort} onSort={onSort}>
            Criticality
          </SortableHead>
          <SortableHead sortKey="openIssues" sort={sort} onSort={onSort} align="right">
            Open issues
          </SortableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((resource) => (
          <TableRow key={resource.id}>
            <TableCell className="font-medium">{resource.name}</TableCell>
            <TableCell>{resource.type}</TableCell>
            <TableCell>{PROVIDER_LABELS[resource.provider]}</TableCell>
            <TableCell>{ENVIRONMENT_LABELS[resource.environment]}</TableCell>
            <TableCell>
              <Badge variant={resource.criticality}>
                {CRITICALITY_LABELS[resource.criticality]}
              </Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">{resource.openIssues}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
