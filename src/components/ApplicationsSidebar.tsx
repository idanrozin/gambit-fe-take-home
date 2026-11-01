import { EmptyState } from '@/components/ui';
import { useApplications } from '@/components/ApplicationsProvider';

/** The list of Applications, newest first. */
export function ApplicationsSidebar() {
  const applications = useApplications();

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No Applications yet"
        description="Select resources in the table, then choose Create Application to group them."
      />
    );
  }

  return (
    <ul className="space-y-1">
      {applications.map(({ id, name, description, resourceIds }) => (
        // Mounts once per Application, so the highlight plays when one is created.
        <li key={id} className="rounded-md px-2 py-1.5 motion-safe:animate-[highlight_2s_ease-out]">
          <p className="flex items-baseline justify-between gap-2 text-sm font-medium">
            <span className="min-w-0 truncate">{name}</span>
            <span className="shrink-0 text-xs font-normal text-muted-foreground tabular-nums">
              {resourceIds.length} {resourceIds.length === 1 ? 'resource' : 'resources'}
            </span>
          </p>
          {description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
