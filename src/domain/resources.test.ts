import { CRITICALITIES, ENVIRONMENTS, PROVIDERS } from './labels';
import { RESOURCES } from './resources';

describe('RESOURCES', () => {
  it('has 12 resources with unique ids and names', () => {
    expect(RESOURCES).toHaveLength(12);
    expect(new Set(RESOURCES.map((r) => r.id)).size).toBe(12);
    expect(new Set(RESOURCES.map((r) => r.name)).size).toBe(12);
  });

  it('covers every provider, environment and criticality', () => {
    expect(new Set(RESOURCES.map((r) => r.provider))).toEqual(new Set(PROVIDERS));
    expect(new Set(RESOURCES.map((r) => r.environment))).toEqual(new Set(ENVIRONMENTS));
    expect(new Set(RESOURCES.map((r) => r.criticality))).toEqual(new Set(CRITICALITIES));
  });

  it('has several owners, open issues up to about 12 and some zeros', () => {
    expect(new Set(RESOURCES.map((r) => r.owner)).size).toBeGreaterThanOrEqual(4);
    expect(Math.max(...RESOURCES.map((r) => r.openIssues))).toBeLessThanOrEqual(12);
    expect(RESOURCES.some((r) => r.openIssues === 0)).toBe(true);
  });
});
