import type { Criticality, Environment, Provider, Resource } from './types';

export interface ResourceFilters {
  search: string;
  providers: Provider[];
  environments: Environment[];
  criticalities: Criticality[];
}

export const NO_FILTERS: ResourceFilters = {
  search: '',
  providers: [],
  environments: [],
  criticalities: [],
};

/** True when `selected` is empty (no constraint) or contains `value`: OR within one attribute. */
const matchesAny = <T>(selected: T[], value: T) =>
  selected.length === 0 || selected.includes(value);

/** AND across the name search and each attribute filter. The search is trimmed and case-insensitive. */
export function filterResources(resources: Resource[], filters: ResourceFilters): Resource[] {
  const needle = filters.search.trim().toLowerCase();
  return resources.filter(
    (r) =>
      r.name.toLowerCase().includes(needle) &&
      matchesAny(filters.providers, r.provider) &&
      matchesAny(filters.environments, r.environment) &&
      matchesAny(filters.criticalities, r.criticality),
  );
}

/** Whitespace alone is not a search, so it does not count as active. */
export function hasActiveFilters(filters: ResourceFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.providers.length > 0 ||
    filters.environments.length > 0 ||
    filters.criticalities.length > 0
  );
}
