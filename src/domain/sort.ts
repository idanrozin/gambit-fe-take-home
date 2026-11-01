import { CRITICALITIES } from './labels';
import type { Criticality, Resource } from './types';

export type SortKey = 'name' | 'criticality' | 'openIssues';
export type SortDirection = 'asc' | 'desc';
export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

/** Riskiest first: criticality descending, then open issues descending. */
export const DEFAULT_SORT: SortState = { key: 'criticality', direction: 'desc' };

/** Rank follows the `CRITICALITIES` display order, so `low` is the lowest. */
const CRITICALITY_RANK = Object.fromEntries(
  [...CRITICALITIES].reverse().map((value, rank) => [value, rank]),
) as Record<Criticality, number>;

/** The direction a column starts in when first selected: names read A–Z, risk reads highest first. */
export function defaultDirection(key: SortKey): SortDirection {
  return key === 'name' ? 'asc' : 'desc';
}

export function toggleSort(current: SortState, key: SortKey): SortState {
  if (current.key !== key) return { key, direction: defaultDirection(key) };
  return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
}

const compareName = (a: Resource, b: Resource) => a.name.localeCompare(b.name);
const byCriticality = (a: Resource, b: Resource) =>
  CRITICALITY_RANK[a.criticality] - CRITICALITY_RANK[b.criticality];
const byOpenIssues = (a: Resource, b: Resource) => a.openIssues - b.openIssues;

/**
 * Compares on the sorted column in its direction. Ties fall back to a fixed order (riskiest
 * first, then name) that does not flip with the direction, so equal rows never jump around.
 */
export function sortResources(resources: Resource[], { key, direction }: SortState): Resource[] {
  const sign = direction === 'asc' ? 1 : -1;
  const primary = { name: compareName, criticality: byCriticality, openIssues: byOpenIssues }[key];
  return [...resources].sort(
    (a, b) =>
      sign * primary(a, b) || byCriticality(b, a) || byOpenIssues(b, a) || compareName(a, b),
  );
}
