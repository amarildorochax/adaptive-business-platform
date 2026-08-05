import type { ExecutionStep } from './ExecutionStep';
import type { ExecutionStepRepository } from './ExecutionStepRepository';

/** ExecutionStepService — nenhum precedente legado equivalente foi encontrado neste domínio. Nenhuma emissão de Evento/Audit aqui. */
export class ExecutionStepService {
  constructor(private readonly repository: ExecutionStepRepository) {}

  async start(executionId: string, actionId: string): Promise<ExecutionStep> {
    const step: ExecutionStep = {
      executionStepId: crypto.randomUUID(),
      executionId,
      actionId,
      status: 'Pending',
      attemptCount: 0,
      startedAt: new Date(),
    };

    return this.repository.create(step);
  }

  async complete(executionStepId: string): Promise<ExecutionStep> {
    const existing = await this.repository.get(executionStepId);

    if (!existing) {
      throw new Error(`Execution Step ${executionStepId} não encontrado.`);
    }

    return this.repository.update({ ...existing, status: 'Completed', completedAt: new Date() });
  }

  async fail(executionStepId: string): Promise<ExecutionStep> {
    const existing = await this.repository.get(executionStepId);

    if (!existing) {
      throw new Error(`Execution Step ${executionStepId} não encontrado.`);
    }

    return this.repository.update({ ...existing, status: 'Failed', completedAt: new Date() });
  }

  async incrementAttempt(executionStepId: string): Promise<ExecutionStep> {
    const existing = await this.repository.get(executionStepId);

    if (!existing) {
      throw new Error(`Execution Step ${executionStepId} não encontrado.`);
    }

    return this.repository.update({ ...existing, attemptCount: existing.attemptCount + 1 });
  }

  async get(executionStepId: string): Promise<ExecutionStep | undefined> {
    return this.repository.get(executionStepId);
  }

  async list(executionId: string): Promise<readonly ExecutionStep[]> {
    return this.repository.list(executionId);
  }
}
