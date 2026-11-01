import { DeleteApplicationButton } from '@/components/DeleteApplicationButton';
import { EmptyState } from '@/components/ui';
import { useApplications } from '@/components/ApplicationsProvider';
import { useOpenApplicationId } from '@/hooks/useOpenApplicationId';
import { cn } from '@/lib/utils';

/** The list of Applications, newest first. */
export function ApplicationsSidebar() {
  const applications = useApplications();
  const [openId, setOpenId] = useOpenApplicationId();

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
      {applications.map((application) => {
        const { id, name, description, resourceIds } = application;
        return (
          // Mounts once per Application, so the highlight plays when one is created.
          <li
            key={id}
            className={cn(
              'flex items-start gap-1 rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent motion-safe:animate-[highlight_2s_ease-out]',
              id === openId && 'bg-sidebar-accent',
            )}
          >
            <button
              type="button"
              aria-current={id === openId ? 'true' : undefined}
              onClick={() => void setOpenId(id)}
              className="min-w-0 flex-1 cursor-pointer rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-baseline justify-between gap-2 text-sm font-medium">
                <span className="min-w-0 truncate">{name}</span>
                <span className="shrink-0 text-xs font-normal text-muted-foreground tabular-nums">
                  {resourceIds.length} {resourceIds.length === 1 ? 'resource' : 'resources'}
                </span>
              </span>
              {description && (
                <span className="line-clamp-2 block text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </button>
            <DeleteApplicationButton application={application} />
          </li>
        );
      })}
    </ul>
  );
}
