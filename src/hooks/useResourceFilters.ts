import {
  debounce,
  parseAsArrayOf,
  parseAsStringLiteral,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { CRITICALITIES, ENVIRONMENTS, PROVIDERS, type ResourceFilters } from '@/domain';

/**
 * Invalid values are dropped by the parsers, so a hand-edited URL never crashes. Typing updates
 * state at once while the URL write is debounced; filter changes push history entries so Back
 * steps through them, search edits replace the current one.
 */
const parsers = {
  search: parseAsString.withDefault('').withOptions({
    history: 'replace',
    limitUrlUpdates: debounce(300),
  }),
  providers: parseAsArrayOf(parseAsStringLiteral(PROVIDERS))
    .withDefault([])
    .withOptions({ history: 'push' }),
  environments: parseAsArrayOf(parseAsStringLiteral(ENVIRONMENTS))
    .withDefault([])
    .withOptions({ history: 'push' }),
  criticalities: parseAsArrayOf(parseAsStringLiteral(CRITICALITIES))
    .withDefault([])
    .withOptions({ history: 'push' }),
};

const urlKeys = {
  search: 'q',
  providers: 'provider',
  environments: 'env',
  criticalities: 'criticality',
};

export function useResourceFilters() {
  const [filters, setFilters] = useQueryStates(parsers, { urlKeys });
  const clear = () => setFilters(null);
  return [filters satisfies ResourceFilters, setFilters, clear] as const;
}
