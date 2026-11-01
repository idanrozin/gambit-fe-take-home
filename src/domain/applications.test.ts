import {
  applicationsReducer,
  buildApplication,
  createApplicationId,
  validateApplication,
  type ApplicationDraft,
} from './applications';
import type { Application } from './types';

const application = (name: string, id = name): Application => ({
  id,
  name,
  resourceIds: ['r1'],
});

const draft = (overrides: Partial<ApplicationDraft> = {}): ApplicationDraft => ({
  name: 'Payments API',
  description: '',
  resourceIds: ['r1'],
  ...overrides,
});

describe('applicationsReducer', () => {
  it('puts a created Application first and does not mutate the state', () => {
    const state = [application('Old')];
    const next = applicationsReducer(state, { type: 'created', application: application('New') });
    expect(next.map((a) => a.name)).toEqual(['New', 'Old']);
    expect(state).toHaveLength(1);
  });
});

describe('createApplicationId', () => {
  it('returns a different id each time', () => {
    expect(createApplicationId()).not.toBe(createApplicationId());
  });
});

describe('buildApplication', () => {
  it('trims the name and description and keeps resource ids', () => {
    expect(
      buildApplication(draft({ name: '  Web  ', description: ' Front end ' }), 'id-1'),
    ).toEqual({ id: 'id-1', name: 'Web', description: 'Front end', resourceIds: ['r1'] });
  });

  it('omits a blank description', () => {
    expect(buildApplication(draft({ description: '   ' }), 'id-1')).not.toHaveProperty(
      'description',
    );
  });
});

describe('validateApplication', () => {
  it('accepts a valid draft', () => {
    expect(validateApplication(draft(), [])).toEqual({});
  });

  it('requires a name after trimming', () => {
    expect(validateApplication(draft({ name: '   ' }), []).name).toBe('Enter a name.');
  });

  it('allows 60 characters and rejects 61', () => {
    expect(validateApplication(draft({ name: 'a'.repeat(60) }), []).name).toBeUndefined();
    expect(validateApplication(draft({ name: 'a'.repeat(61) }), []).name).toMatch(/60 characters/);
  });

  it('rejects a duplicate name ignoring case and surrounding space', () => {
    const existing = [application('Payments API')];
    expect(validateApplication(draft({ name: ' payments api ' }), existing).name).toMatch(
      /already exists/,
    );
    expect(validateApplication(draft({ name: 'Payments' }), existing).name).toBeUndefined();
  });

  it('requires at least 1 resource', () => {
    expect(validateApplication(draft({ resourceIds: [] }), []).resourceIds).toBe(
      'Select at least 1 resource.',
    );
  });

  it('limits the description to 200 characters', () => {
    expect(
      validateApplication(draft({ description: 'a'.repeat(200) }), []).description,
    ).toBeUndefined();
    expect(validateApplication(draft({ description: 'a'.repeat(201) }), []).description).toMatch(
      /200 characters/,
    );
  });

  it('reports every invalid field at once', () => {
    expect(Object.keys(validateApplication(draft({ name: '', resourceIds: [] }), []))).toEqual([
      'name',
      'resourceIds',
    ]);
  });
});
