import type { Application } from './types';

export const NAME_MAX_LENGTH = 60;
export const DESCRIPTION_MAX_LENGTH = 200;

export interface ApplicationDraft {
  name: string;
  description: string;
  resourceIds: string[];
}

export type ApplicationErrors = Partial<Record<keyof ApplicationDraft, string>>;

export type ApplicationsAction =
  { type: 'created'; application: Application } | { type: 'deleted'; id: string };

/** Newest first, so the sidebar shows the latest Application at the top. */
export function applicationsReducer(
  applications: Application[],
  action: ApplicationsAction,
): Application[] {
  switch (action.type) {
    case 'created':
      return [action.application, ...applications];
    case 'deleted':
      return applications.filter((application) => application.id !== action.id);
  }
}

function createApplicationId(): string {
  return crypto.randomUUID();
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function isNameTaken(name: string, applications: Application[]): boolean {
  return applications.some((application) => sameName(application.name, name));
}

/** Returns one specific message per invalid field; an empty object means the draft is valid. */
export function validateApplication(
  { name, description, resourceIds }: ApplicationDraft,
  existing: Application[],
): ApplicationErrors {
  const errors: ApplicationErrors = {};
  const trimmedName = name.trim();
  if (!trimmedName) errors.name = 'Enter a name.';
  else if (trimmedName.length > NAME_MAX_LENGTH)
    errors.name = `Name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  else if (isNameTaken(trimmedName, existing))
    errors.name = 'An Application with this name already exists.';

  if (resourceIds.length === 0) errors.resourceIds = 'Select at least 1 resource.';

  if (description.trim().length > DESCRIPTION_MAX_LENGTH)
    errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;

  return errors;
}

/** Builds the stored Application from a draft that passed `validateApplication`. */
export function buildApplication(draft: ApplicationDraft, id = createApplicationId()): Application {
  const description = draft.description.trim();
  return {
    id,
    name: draft.name.trim(),
    ...(description && { description }),
    resourceIds: draft.resourceIds,
  };
}

/** The Applications that include `resourceId`, in the order given. */
export function applicationsContaining(
  resourceId: string,
  applications: Application[],
): Application[] {
  return applications.filter((application) => application.resourceIds.includes(resourceId));
}
