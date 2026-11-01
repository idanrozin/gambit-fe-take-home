import { XIcon } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Badge, Button } from '@/components/ui';
import {
  CRITICALITY_LABELS,
  ENVIRONMENT_LABELS,
  PROVIDER_LABELS,
  type Application,
  type Resource,
} from '@/domain';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

interface ResourceDetailsProps {
  resource: Resource;
  /** The other Applications that include this resource. */
  otherApplications: Application[];
  onSelectApplication: (id: string) => void;
  onDismiss: () => void;
}

/** Every field of a resource, shown inside the Application drawer. */
export function ResourceDetails({
  resource,
  otherApplications,
  onSelectApplication,
  onDismiss,
}: ResourceDetailsProps) {
  const headingId = useId();
  const section = useRef<HTMLElement>(null);
  // The section opens below the graph, possibly out of view in the scrolling drawer.
  useEffect(() => {
    section.current?.scrollIntoView?.({ block: 'nearest' });
  }, [resource.id]);
  return (
    <section ref={section} aria-labelledby={headingId} className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 id={headingId} className="min-w-0 truncate text-base font-semibold">
          {resource.name}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close details"
          onClick={onDismiss}
        >
          <XIcon aria-hidden />
        </Button>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <Field label="Type">{resource.type}</Field>
        <Field label="Provider">{PROVIDER_LABELS[resource.provider]}</Field>
        <Field label="Region">{resource.region}</Field>
        <Field label="Environment">{ENVIRONMENT_LABELS[resource.environment]}</Field>
        <Field label="Criticality">
          <Badge variant={resource.criticality}>{CRITICALITY_LABELS[resource.criticality]}</Badge>
        </Field>
        <Field label="Owner">{resource.owner}</Field>
        <Field label="Open issues">{resource.openIssues}</Field>
        <div className="col-span-full">
          <dt className="text-xs text-muted-foreground">Tags</dt>
          <dd className="mt-1 flex flex-wrap gap-1.5">
            {resource.tags.length > 0 ? (
              resource.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)
            ) : (
              <span className="text-sm text-muted-foreground">None</span>
            )}
          </dd>
        </div>
      </dl>
      {otherApplications.length > 0 && (
        <div className="mt-4 border-t pt-3">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Also in
          </h4>
          <ul className="mt-1.5 flex flex-wrap gap-2">
            {otherApplications.map((application) => (
              <li key={application.id}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectApplication(application.id)}
                >
                  {application.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
