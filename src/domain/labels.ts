import type { Criticality, Environment, Provider } from './types';

/**
 * Display labels for the domain's unions. Typing them as `Record<Union, string>` makes the
 * compiler fail when a union gains a member we don't handle. Key order is the display order.
 */
export const PROVIDER_LABELS: Record<Provider, string> = {
  AWS: 'AWS',
  GCP: 'GCP',
  Azure: 'Azure',
};

export const ENVIRONMENT_LABELS: Record<Environment, string> = {
  production: 'Production',
  staging: 'Staging',
  development: 'Development',
};

export const CRITICALITY_LABELS: Record<Criticality, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/** The keys of a label record, typed as the union. Object.keys loses the key type. */
export function valuesOf<T extends string>(labels: Record<T, string>): T[] {
  return Object.keys(labels) as T[];
}

export const PROVIDERS = valuesOf(PROVIDER_LABELS);
export const ENVIRONMENTS = valuesOf(ENVIRONMENT_LABELS);
export const CRITICALITIES = valuesOf(CRITICALITY_LABELS);
