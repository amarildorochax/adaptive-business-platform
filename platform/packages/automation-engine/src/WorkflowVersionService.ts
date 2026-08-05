import type { WorkflowVersion } from './WorkflowVersion';
import type { WorkflowVersionRepository } from './WorkflowVersionRepository';

/** WorkflowVersionService — nenhum precedente legado equivalente foi encontrado (o Automation Center legado nunca versiona uma AutomationRule — apenas `updatedAt`). Nenhuma emissão de Evento/Audit aqui — responsabilidade exclusiva de AutomationManager. */
export class WorkflowVersionService {
  constructor(private readonly repository: WorkflowVersionRepository) {}

  async recordVersion(workflowId: string, version: number): Promise<WorkflowVersion> {
    const existing = await this.repository.list(workflowId);
    const current = existing.find((v) => v.supersededAt === undefined);

    if (current) {
      await this.repository.update({ ...current, supersededAt: new Date() });
    }

    return this.repository.create({ workflowId, version });
  }

  async list(workflowId: string): Promise<readonly WorkflowVersion[]> {
    return this.repository.list(workflowId);
  }
}
