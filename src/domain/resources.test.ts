import { CRITICALITIES, ENVIRONMENTS, PROVIDERS } from './labels';
import { RESOURCES } from './resources';

describe('RESOURCES', () => {
  it('has unique ids and names', () => {
    expect(new Set(RESOURCES.map((r) => r.id)).size).toBe(RESOURCES.length);
    expect(new Set(RESOURCES.map((r) => r.name)).size).toBe(RESOURCES.length);
  });

  it('covers every provider, environment and criticality', () => {
    expect(new Set(RESOURCES.map((r) => r.provider))).toEqual(new Set(PROVIDERS));
    expect(new Set(RESOURCES.map((r) => r.environment))).toEqual(new Set(ENVIRONMENTS));
    expect(new Set(RESOURCES.map((r) => r.criticality))).toEqual(new Set(CRITICALITIES));
  });
});
