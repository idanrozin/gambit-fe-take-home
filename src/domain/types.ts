export type Provider = 'AWS' | 'GCP' | 'Azure';
export type Environment = 'production' | 'staging' | 'development';
export type Criticality = 'low' | 'medium' | 'high' | 'critical';

export interface Resource {
  id: string;
  name: string;
  /** Free text, e.g. "S3 Bucket", "IAM Role". */
  type: string;
  provider: Provider;
  region: string;
  environment: Environment;
  criticality: Criticality;
  owner: string;
  tags: string[];
  /** In the brief's sample data and required table columns, though missing from its interface. */
  openIssues: number;
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  resourceIds: string[];
}
