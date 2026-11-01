import { createContext, use, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { applicationsReducer, type ApplicationsAction, type Application } from '@/domain';

const ApplicationsContext = createContext<Application[] | null>(null);
const ApplicationsDispatchContext = createContext<Dispatch<ApplicationsAction> | null>(null);

/** Applications are the app's only shared state, held in memory: a reload clears them. */
export function ApplicationsProvider({
  children,
  initialApplications = [],
}: {
  children: ReactNode;
  /** Only for tests, to start with Applications already created. */
  initialApplications?: Application[];
}) {
  const [applications, dispatch] = useReducer(applicationsReducer, initialApplications);
  return (
    <ApplicationsDispatchContext value={dispatch}>
      <ApplicationsContext value={applications}>{children}</ApplicationsContext>
    </ApplicationsDispatchContext>
  );
}

export function useApplications() {
  const context = use(ApplicationsContext);
  if (!context) throw new Error('useApplications must be used within ApplicationsProvider');
  return context;
}

/** Write side only: components using it don't re-render when the Applications change. */
export function useApplicationActions() {
  const dispatch = use(ApplicationsDispatchContext);
  if (!dispatch) throw new Error('useApplicationActions must be used within ApplicationsProvider');
  return useMemo(
    () => ({
      create: (application: Application) => dispatch({ type: 'created', application }),
      remove: (id: string) => dispatch({ type: 'deleted', id }),
    }),
    [dispatch],
  );
}
