import { useId, useState, type FormEvent } from 'react';
import { XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useApplicationActions, useApplications } from '@/components/ApplicationsProvider';
import { Button, Input, Textarea } from '@/components/ui';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  CRITICALITY_LABELS,
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  buildApplication,
  validateApplication,
  type Application,
  type Resource,
} from '@/domain';

interface CreateApplicationSheetProps {
  /** The ids to start from; `null` keeps the sheet closed. */
  initialResourceIds: string[] | null;
  resources: Resource[];
  onClose: () => void;
  onCreated: (application: Application) => void;
}

export function CreateApplicationSheet({
  initialResourceIds,
  resources,
  onClose,
  onCreated,
}: CreateApplicationSheetProps) {
  return (
    <Sheet open={initialResourceIds !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create Application</SheetTitle>
          <SheetDescription>Group the selected resources under a name.</SheetDescription>
        </SheetHeader>
        {/* Radix unmounts the content when closed, so each opening starts a fresh draft. */}
        <CreateApplicationForm
          initialResourceIds={initialResourceIds ?? []}
          resources={resources}
          onCancel={onClose}
          onCreated={onCreated}
        />
      </SheetContent>
    </Sheet>
  );
}

function CreateApplicationForm({
  initialResourceIds,
  resources,
  onCancel,
  onCreated,
}: {
  initialResourceIds: string[];
  resources: Resource[];
  onCancel: () => void;
  onCreated: (application: Application) => void;
}) {
  const applications = useApplications();
  const { create } = useApplicationActions();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [resourceIds, setResourceIds] = useState(initialResourceIds);
  // Errors stay hidden until the first submit, then follow the fields, so fixing one clears it.
  const [submitted, setSubmitted] = useState(false);
  const draft = { name, description, resourceIds };
  const errors = submitted ? validateApplication(draft, applications) : {};
  const nameId = useId();
  const descriptionId = useId();
  const resourcesId = useId();

  const members = resourceIds.flatMap((id) => resources.find((r) => r.id === id) ?? []);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validateApplication(draft, applications)).length > 0) return;
    const application = buildApplication(draft);
    // Stop validating: the new Application would otherwise clash with itself while the sheet closes.
    setSubmitted(false);
    create(application);
    toast.success(`Created ${application.name}`);
    onCreated(application);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto">
      <div className="space-y-4 px-4">
        <Field id={nameId} label="Name" error={errors.name}>
          <Input
            id={nameId}
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            autoComplete="off"
          />
          <Counter value={name.trim().length} max={NAME_MAX_LENGTH} />
        </Field>
        <Field id={descriptionId} label="Description (optional)" error={errors.description}>
          <Textarea
            id={descriptionId}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? `${descriptionId}-error` : undefined}
          />
          <Counter value={description.trim().length} max={DESCRIPTION_MAX_LENGTH} />
        </Field>
        <section aria-labelledby={resourcesId} className="space-y-1.5">
          <h3 id={resourcesId} className="text-sm font-medium">
            Resources ({members.length})
          </h3>
          {members.length > 0 && (
            <ul className="divide-y rounded-lg border">
              {members.map((resource) => (
                <li key={resource.id} className="flex items-center gap-2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{resource.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {resource.type} · {CRITICALITY_LABELS[resource.criticality]}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${resource.name}`}
                    onClick={() => setResourceIds((ids) => ids.filter((id) => id !== resource.id))}
                  >
                    <XIcon />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {errors.resourceIds && (
            <p role="alert" className="text-sm text-destructive">
              {errors.resourceIds}
            </p>
          )}
          {members.length === 0 && !errors.resourceIds && (
            <p className="text-sm text-muted-foreground">No resources left in this Application.</p>
          )}
        </section>
      </div>
      <SheetFooter className="flex-row justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Application</Button>
      </SheetFooter>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <p className="text-right text-xs text-muted-foreground tabular-nums" aria-hidden="true">
      {value}/{max}
    </p>
  );
}
