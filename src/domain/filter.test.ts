import { filterResources, hasActiveFilters, NO_FILTERS, type ResourceFilters } from './filter';
import type { Resource } from './types';

function resource(name: string, overrides: Partial<Resource> = {}): Resource {
  return {
    id: name,
    name,
    type: 'S3 Bucket',
    provider: 'AWS',
    region: 'us-east-1',
    environment: 'production',
    criticality: 'high',
    owner: 'payments',
    tags: [],
    openIssues: 0,
    ...overrides,
  };
}

const RESOURCES = [
  resource('payments-db'),
  resource('payments-cache', { provider: 'GCP', environment: 'staging', criticality: 'low' }),
  resource('data-lake', { provider: 'Azure', environment: 'development', criticality: 'medium' }),
  resource('Audit-Logs', { provider: 'GCP', criticality: 'critical' }),
];

const names = (filters: Partial<ResourceFilters>) =>
  filterResources(RESOURCES, { ...NO_FILTERS, ...filters }).map((r) => r.name);

describe('filterResources', () => {
  it('returns every resource when nothing is active', () => {
    expect(names({})).toHaveLength(RESOURCES.length);
  });

  it('searches names case-insensitively and trimmed', () => {
    expect(names({ search: '  PAYMENTS ' })).toEqual(['payments-db', 'payments-cache']);
    expect(names({ search: 'audit' })).toEqual(['Audit-Logs']);
  });

  it('treats a whitespace-only search as no search', () => {
    expect(names({ search: '   ' })).toHaveLength(RESOURCES.length);
  });

  it('combines values within one attribute with OR', () => {
    expect(names({ providers: ['AWS', 'Azure'] })).toEqual(['payments-db', 'data-lake']);
  });

  it('combines attributes and the search with AND', () => {
    expect(names({ providers: ['GCP'], criticalities: ['low', 'critical'] })).toEqual([
      'payments-cache',
      'Audit-Logs',
    ]);
    expect(names({ search: 'payments', providers: ['GCP'], environments: ['staging'] })).toEqual([
      'payments-cache',
    ]);
    expect(names({ search: 'data', providers: ['GCP'] })).toEqual([]);
  });

  it('does not mutate its input', () => {
    const input = [...RESOURCES];
    filterResources(input, { ...NO_FILTERS, providers: ['GCP'] });
    expect(input).toEqual(RESOURCES);
  });
});

describe('hasActiveFilters', () => {
  it('is false for the empty filters and a blank search', () => {
    expect(hasActiveFilters(NO_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...NO_FILTERS, search: '  ' })).toBe(false);
  });

  it('is true when the search or any attribute filter is set', () => {
    expect(hasActiveFilters({ ...NO_FILTERS, search: 'db' })).toBe(true);
    expect(hasActiveFilters({ ...NO_FILTERS, providers: ['AWS'] })).toBe(true);
    expect(hasActiveFilters({ ...NO_FILTERS, environments: ['staging'] })).toBe(true);
    expect(hasActiveFilters({ ...NO_FILTERS, criticalities: ['low'] })).toBe(true);
  });
});
