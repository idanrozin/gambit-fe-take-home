import { parseAsString, useQueryState } from 'nuqs';

/**
 * The id of the Application whose graph is open, kept in the URL (`?app=`). Opening pushes a
 * history entry so Back closes the drawer. The id may not match any Application: resolve it
 * against `useApplications()`.
 */
export function useOpenApplicationId() {
  return useQueryState('app', parseAsString.withOptions({ history: 'push' }));
}
