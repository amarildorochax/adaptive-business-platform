import type { RetryPolicy } from './RetryPolicy';
import type { RetryPolicyRepository } from './RetryPolicyRepository';

/** RetryPolicyService — nenhum precedente legado equivalente foi encontrado (o Automation Center legado nunca modela política de nova tentativa — `AutomationAction` não tem nenhum campo equivalente). Nenhuma emissão de Evento/Audit aqui. */
export class RetryPolicyService {
  constructor(private readonly repository: RetryPolicyRepository) {}

  async define(maxAttempts: number, backoffDescription: string): Promise<RetryPolicy> {
    const policy: RetryPolicy = { retryPolicyId: crypto.randomUUID(), maxAttempts, backoffDescription };
    return this.repository.create(policy);
  }

  async get(retryPolicyId: string): Promise<RetryPolicy | undefined> {
    return this.repository.get(retryPolicyId);
  }
}
