import type { PromptExecution, PromptLayer } from './PromptExecution';
import type { PromptExecutionRepository } from './PromptExecutionRepository';

/** Prompt Execution Service — registra cada composição de prompt já concluída pelo Prompt Composer, per `PromptExecution.ts`. Nenhum precedente legado direto. */
export class PromptExecutionService {
  constructor(private readonly repository: PromptExecutionRepository) {}

  async record(tenantId: string, composedPrompt: string, layersUsed: readonly PromptLayer[], promptTemplateId?: string): Promise<PromptExecution> {
    const execution: PromptExecution = {
      promptExecutionId: crypto.randomUUID(),
      tenantId,
      promptTemplateId,
      composedPrompt,
      layersUsed,
      composedAt: new Date(),
    };

    return this.repository.create(execution);
  }

  async list(tenantId: string): Promise<readonly PromptExecution[]> {
    return this.repository.list(tenantId);
  }
}
