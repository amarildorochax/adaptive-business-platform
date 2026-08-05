import type { Execution } from './Execution';
import type { ExecutionRepository } from './ExecutionRepository';

/** ExecutionService — nenhum precedente legado equivalente foi encontrado neste domínio (o Execution/ExecutionEngine legado em `src/core/execution/`, `src/core/execution-engine/` pertence à execução de Agente de IA, um domínio diferente — ver relatório desta Sprint). Nenhuma emissão de Evento/Audit aqui. */
export class ExecutionService {
  constructor(private readonly repository: ExecutionRepository) {}

  async start(workflowId: string, triggerId: string): Promise<Execution> {
    const execution: Execution = { executionId: crypto.randomUUID(), workflowId, triggerId, status: 'Running', startedAt: new Date() };
    return this.repository.create(execution);
  }

  async succeed(executionId: string): Promise<Execution> {
    return this.transition(executionId, 'Succeeded');
  }

  async fail(executionId: string): Promise<Execution> {
    return this.transition(executionId, 'Failed');
  }

  async get(executionId: string): Promise<Execution | undefined> {
    return this.repository.get(executionId);
  }

  async list(workflowId: string): Promise<readonly Execution[]> {
    return this.repository.list(workflowId);
  }

  private async transition(executionId: string, status: Execution['status']): Promise<Execution> {
    const existing = await this.repository.get(executionId);

    if (!existing) {
      throw new Error(`Execution ${executionId} não encontrada.`);
    }

    return this.repository.update({ ...existing, status, completedAt: new Date() });
  }
}
