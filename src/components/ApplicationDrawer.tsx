import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ApplicationGraph, type Focusable } from '@/components/ApplicationGraph';
import { ApplicationSwitcher } from '@/components/ApplicationSwitcher';
import { useApplications } from '@/components/ApplicationsProvider';
import { DeleteApplicationButton } from '@/components/DeleteApplicationButton';
import { MemberList } from '@/components/MemberList';
import { ResourceDetails } from '@/components/ResourceDetails';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { applicationsContaining, type Application, type Resource } from '@/domain';
import { useOpenApplicationId } from '@/hooks/useOpenApplicationId';

/** The graph of the Application named by `?app=`; open exactly when that id resolves. */
export function ApplicationDrawer({ resources }: { resources: Resource[] }) {
  const [id, setId] = useOpenApplicationId();
  const applications = useApplications();
  const application = applications.find((candidate) => candidate.id === id);
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

  // The control that triggered a switch unmounts with the old Application; focus the new title.
  const titleRef = useRef<HTMLHeadingElement>(null);
  const focusTitleOnSwitch = useRef(false);
  const switchTo = (nextId: string) => {
    focusTitleOnSwitch.current = true;
    void setId(nextId, { history: 'replace' });
  };
  const openId = application?.id;
  useEffect(() => {
    if (!focusTitleOnSwitch.current) return;
    focusTitleOnSwitch.current = false;
    titleRef.current?.focus();
  }, [openId]);

  const members = application
    ? application.resourceIds.flatMap(
        (resourceId) => resources.find((r) => r.id === resourceId) ?? [],
      )
    : [];

  return (
    <Sheet open={!!application} onOpenChange={(open) => !open && void setId(null)}>
      {application && (
        <SheetContent className="data-[side=right]:w-full data-[side=right]:sm:max-w-5xl">
          <SheetHeader className="pr-14">
            <div className="flex items-center gap-2">
              <SheetTitle
                ref={titleRef}
                tabIndex={-1}
                className="min-w-0 truncate text-lg outline-none"
              >
                {application.name}
              </SheetTitle>
              <DeleteApplicationButton application={application} />
              <div className="ml-auto">
                <ApplicationSwitcher
                  applications={applications}
                  currentId={application.id}
                  onSwitch={switchTo}
                />
              </div>
            </div>
            <SheetDescription>
              {application.description ?? 'No description.'} · {members.length}{' '}
              {members.length === 1 ? 'resource' : 'resources'}
            </SheetDescription>
          </SheetHeader>
          {/* Keyed so highlight and details don't carry over when the drawer switches Application. */}
          <ApplicationBody
            key={application.id}
            application={application}
            members={members}
            onSwitchApplication={switchTo}
          />
        </SheetContent>
      )}
    </Sheet>
  );
}

interface ApplicationBodyProps {
  application: Application;
  members: Resource[];
  onSwitchApplication: (id: string) => void;
}

/** The graph, the member list and the details of the selected resource. */
function ApplicationBody({ application, members, onSwitchApplication }: ApplicationBodyProps) {
  const applications = useApplications();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The node or row that opened the details, to focus again when they are dismissed.
  const trigger = useRef<Focusable | null>(null);
  const selected = members.find((member) => member.id === selectedId);

  const select = (resourceId: string, element: Focusable) => {
    trigger.current = element;
    setSelectedId(resourceId);
  };
  // Focus handed back after dismissing is not the user pointing at the element: no highlight.
  const restoringFocus = useRef(false);
  const highlight = (resourceId: string | null) => {
    if (!restoringFocus.current) setHighlightedId(resourceId);
  };
  const dismiss = () => {
    setSelectedId(null);
    restoringFocus.current = true;
    trigger.current?.focus();
    restoringFocus.current = false;
  };

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 scrollbar-subtle">
      <ApplicationGraph
        application={application}
        members={members}
        highlightedId={highlightedId}
        selectedId={selectedId}
        onHighlight={highlight}
        onSelect={select}
        aside={
          <MemberList
            members={members}
            highlightedId={highlightedId}
            selectedId={selectedId}
            onHighlight={highlight}
            onSelect={select}
          />
        }
      />
      {selected && (
        <ResourceDetails
          resource={selected}
          otherApplications={applicationsContaining(selected.id, applications).filter(
            (other) => other.id !== application.id,
          )}
          onSelectApplication={onSwitchApplication}
          onDismiss={dismiss}
        />
      )}
    </div>
  );
}
