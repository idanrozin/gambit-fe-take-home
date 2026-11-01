import { useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { CreateApplicationSheet } from '@/components/CreateApplicationSheet';
import { ResourcesTable } from '@/components/ResourcesTable';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';
import { SelectionBar } from '@/components/SelectionBar';
import { Button, EmptyState, Input } from '@/components/ui';
import {
  CRITICALITY_LABELS,
  DEFAULT_SORT,
  NO_SELECTION,
  ENVIRONMENT_LABELS,
  PROVIDER_LABELS,
  filterResources,
  countHidden,
  hasActiveFilters,
  setVisibleSelected,
  toggleSelected,
  type Resource,
  type SortState,
} from '@/domain';
import { useResourceFilters } from '@/hooks/useResourceFilters';

interface ResourcesViewProps {
  resources: Resource[];
}

/** The resources table with its search and filters (in the URL) and its row selection (local). */
export function ResourcesView({ resources }: ResourcesViewProps) {
  const [filters, setFilters, clearFilters] = useResourceFilters();
  // Held here, not in the table, so it survives the table unmounting on an empty result.
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  // Keyed by id and kept apart from the filters, so hiding a row never deselects it.
  const [selected, setSelected] = useState<ReadonlySet<string>>(NO_SELECTION);
  // The ids being turned into an Application; `null` while the sheet is closed.
  const [creating, setCreating] = useState<string[] | null>(null);
  const visible = filterResources(resources, filters);
  const active = hasActiveFilters(filters);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search resources by name"
            placeholder="Search by name"
            className="pl-8"
            value={filters.search}
            onChange={(event) => void setFilters({ search: event.target.value })}
          />
        </div>
        <MultiSelectFilter
          label="Provider"
          options={PROVIDER_LABELS}
          selected={filters.providers}
          onChange={(providers) => void setFilters({ providers })}
        />
        <MultiSelectFilter
          label="Environment"
          options={ENVIRONMENT_LABELS}
          selected={filters.environments}
          onChange={(environments) => void setFilters({ environments })}
        />
        <MultiSelectFilter
          label="Criticality"
          options={CRITICALITY_LABELS}
          selected={filters.criticalities}
          onChange={(criticalities) => void setFilters({ criticalities })}
        />
        {/* Always mounted: screen readers skip live regions that arrive already filled. */}
        <p role="status" className="text-sm text-muted-foreground tabular-nums">
          {active && `${visible.length} of ${resources.length} resources`}
        </p>
        {active && (
          <Button variant="ghost" onClick={() => void clearFilters()}>
            Clear filters
          </Button>
        )}
        {selected.size > 0 && (
          <SelectionBar
            count={selected.size}
            hiddenCount={countHidden(selected, visible)}
            onClear={() => setSelected(NO_SELECTION)}
            onCreate={() => setCreating([...selected])}
          />
        )}
      </div>
      {visible.length === 0 ? (
        <EmptyState
          title="No resources match"
          description="Try a different search or remove some filters."
          action={
            <Button variant="outline" onClick={() => void clearFilters()}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border">
          <ResourcesTable
            resources={visible}
            sort={sort}
            onSortChange={setSort}
            selected={selected}
            onToggle={(id) => setSelected((current) => toggleSelected(current, id))}
            onToggleAll={(checked) =>
              setSelected((current) => setVisibleSelected(current, visible, checked))
            }
          />
        </div>
      )}
      <CreateApplicationSheet
        initialResourceIds={creating}
        resources={resources}
        onClose={() => setCreating(null)}
        onCreated={() => {
          setCreating(null);
          setSelected(NO_SELECTION);
        }}
      />
    </div>
  );
}
