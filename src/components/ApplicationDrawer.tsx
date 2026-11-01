import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ApplicationGraph } from '@/components/ApplicationGraph';
import { useApplications } from '@/components/ApplicationsProvider';
import { DeleteApplicationButton } from '@/components/DeleteApplicationButton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { Resource } from '@/domain';
import { useOpenApplicationId } from '@/hooks/useOpenApplicationId';

/** The graph of the Application named by `?app=`; open exactly when that id resolves. */
export function ApplicationDrawer({ resources }: { resources: Resource[] }) {
  const [id, setId] = useOpenApplicationId();
  const application = useApplications().find((candidate) => candidate.id === id);
  // The last id that resolved, to tell an Application deleted while open from one never found.
  const lastResolvedId = useRef<string | null>(null);

  useEffect(() => {
    if (id === null) {
      // Forget it once closed, so reopening a since-deleted id from history counts as unknown.
      lastResolvedId.current = null;
      return;
    }
    if (application) {
      lastResolvedId.current = id;
      return;
    }
    if (lastResolvedId.current !== id)
      toast.error("That Application wasn't found.", { id: 'application-not-found' });
    void setId(null, { history: 'replace' });
  }, [id, application, setId]);

  const members = application
    ? application.resourceIds.flatMap(
        (resourceId) => resources.find((r) => r.id === resourceId) ?? [],
      )
    : [];

  return (
    <Sheet open={!!application} onOpenChange={(open) => !open && void setId(null)}>
      {application && (
        <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-3xl">
          <SheetHeader className="pr-14">
            <div className="flex items-center gap-2">
              <SheetTitle className="min-w-0 truncate text-lg">{application.name}</SheetTitle>
              <DeleteApplicationButton application={application} />
            </div>
            <SheetDescription>
              {application.description ?? 'No description.'} · {members.length}{' '}
              {members.length === 1 ? 'resource' : 'resources'}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <ApplicationGraph application={application} members={members} />
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}
