import type { RetryAttempt } from './RetryAttempt';
import type { RetryAttemptRepository } from './RetryAttemptRepository';

/**
 * RetryAttemptService — nenhum precedente legado equivalente foi encontrado (o Automation Center
 * legado nunca modela tentativa de repetição — `execute()` sempre um único passo conceitual, nunca
 * repetido). Retry by Design (`AUTOMATION_ENGINE.md`, ADR-007): cada tentativa é registrada, nunca
 * descartada. Nenhuma emissão de Evento/Audit aqui.
 */
export class RetryAttemptService {
  constructor(private readonly repository: RetryAttemptRepository) {}

  async record(executionStepId: string, attemptNumber: number): Promise<RetryAttempt> {
    const attempt: RetryAttempt = { retryAttemptId: crypto.randomUUID(), executionStepId, attemptNumber, attemptedAt: new Date() };
    return this.repository.create(attempt);
  }

  async list(executionStepId: string): Promise<readonly RetryAttempt[]> {
    return this.repository.list(executionStepId);
  }
}
