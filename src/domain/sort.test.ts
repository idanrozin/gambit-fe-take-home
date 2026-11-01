import { CRITICALITIES } from './labels';
import { DEFAULT_SORT, sortResources, toggleSort } from './sort';
import type { Criticality, Resource } from './types';

function resource(name: string, criticality: Criticality, openIssues: number): Resource {
  return {
    id: name,
    name,
    type: 'S3 Bucket',
    provider: 'AWS',
    region: 'us-east-1',
    environment: 'production',
    criticality,
    owner: 'payments',
    tags: [],
    openIssues,
  };
}

const names = (resources: Resource[]) => resources.map((r) => r.name);

describe('sortResources', () => {
  it('ranks criticality critical > high > medium > low', () => {
    const input = CRITICALITIES.map((c) => resource(c, c, 0));
    expect(names(sortResources(input, { key: 'criticality', direction: 'desc' }))).toEqual([
      'critical',
      'high',
      'medium',
      'low',
    ]);
    expect(names(sortResources(input, { key: 'criticality', direction: 'asc' }))).toEqual([
      'low',
      'medium',
      'high',
      'critical',
    ]);
  });

  it('breaks default-sort ties by open issues descending, then name', () => {
    const input = [
      resource('b', 'high', 3),
      resource('a', 'high', 3),
      resource('c', 'high', 9),
      resource('d', 'critical', 0),
    ];
    expect(names(sortResources(input, DEFAULT_SORT))).toEqual(['d', 'c', 'a', 'b']);
  });

  it('sorts by open issues in either direction, riskiest first on ties', () => {
    const input = [resource('a', 'low', 2), resource('b', 'critical', 2), resource('c', 'low', 7)];
    expect(names(sortResources(input, { key: 'openIssues', direction: 'desc' }))).toEqual([
      'c',
      'b',
      'a',
    ]);
    expect(names(sortResources(input, { key: 'openIssues', direction: 'asc' }))).toEqual([
      'b',
      'a',
      'c',
    ]);
  });

  it('sorts by name in either direction', () => {
    const input = [resource('b', 'low', 0), resource('c', 'low', 0), resource('a', 'low', 0)];
    expect(names(sortResources(input, { key: 'name', direction: 'asc' }))).toEqual(['a', 'b', 'c']);
    expect(names(sortResources(input, { key: 'name', direction: 'desc' }))).toEqual([
      'c',
      'b',
      'a',
    ]);
  });

  it('does not mutate its input', () => {
    const input = [resource('b', 'low', 0), resource('a', 'high', 0)];
    sortResources(input, DEFAULT_SORT);
    expect(names(input)).toEqual(['b', 'a']);
  });
});

describe('toggleSort', () => {
  it('flips the direction of the active column', () => {
    expect(toggleSort(DEFAULT_SORT, 'criticality')).toEqual({
      key: 'criticality',
      direction: 'asc',
    });
  });

  it('starts a new column in its natural direction', () => {
    expect(toggleSort(DEFAULT_SORT, 'name')).toEqual({ key: 'name', direction: 'asc' });
    expect(toggleSort({ key: 'name', direction: 'asc' }, 'openIssues')).toEqual({
      key: 'openIssues',
      direction: 'desc',
    });
  });
});
