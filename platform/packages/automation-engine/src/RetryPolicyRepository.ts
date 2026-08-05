import type { RetryPolicy } from './RetryPolicy';

/** Contrato de persistência de Retry Policy — apenas o contrato. */
export interface RetryPolicyRepository {
  create(policy: RetryPolicy): Promise<RetryPolicy>;
  get(retryPolicyId: string): Promise<RetryPolicy | undefined>;
}
