import type { Workflow } from './Workflow';
import type { WorkflowRepository } from './WorkflowRepository';

/**
 * WorkflowService — adaptado de `src/core/automations/{AutomationRule.ts, AutomationService.ts}`
 * (Automation Center legado, real e funcional, distinto de `src/core/automation/`, singular, um stub
 * nunca implementado e sem nenhum consumidor real, per o próprio doc-comment de `Automation.ts`
 * daquele diretório). `AutomationRule.enabled` (booleano) é substituído aqui pelo `WorkflowStatus`
 * já aprovado (`Draft`/`Active`/`Inactive`, três estados, não dois) — o vocabulário do Blueprint nunca
 * é reduzido para se encaixar na forma mais simples do legado. Nenhuma emissão de Evento/Audit aqui —
 * responsabilidade exclusiva de AutomationManager.
 */
export class WorkflowService {
  constructor(private readonly repository: WorkflowRepository) {}

  async create(tenantId: string, name: string, triggerId: string, actionIds: readonly string[]): Promise<Workflow> {
    const workflow: Workflow = {
      workflowId: crypto.randomUUID(),
      tenantId,
      name,
      status: 'Draft',
      version: 1,
      triggerId,
      actionIds,
      createdAt: new Date(),
    };

    return this.repository.create(workflow);
  }

  async edit(workflowId: string, name?: string, actionIds?: readonly string[]): Promise<Workflow> {
    const existing = await this.repository.get(workflowId);

    if (!existing) {
      throw new Error(`Workflow ${workflowId} não encontrado.`);
    }

    return this.repository.update({
      ...existing,
      name: name ?? existing.name,
      actionIds: actionIds ?? existing.actionIds,
      version: existing.version + 1,
    });
  }

  async activate(workflowId: string): Promise<Workflow> {
    return this.transition(workflowId, 'Active');
  }

  async deactivate(workflowId: string): Promise<Workflow> {
    return this.transition(workflowId, 'Inactive');
  }

  async get(workflowId: string): Promise<Workflow | undefined> {
    return this.repository.get(workflowId);
  }

  async list(tenantId: string): Promise<readonly Workflow[]> {
    return this.repository.list(tenantId);
  }

  private async transition(workflowId: string, status: Workflow['status']): Promise<Workflow> {
    const existing = await this.repository.get(workflowId);

    if (!existing) {
      throw new Error(`Workflow ${workflowId} não encontrado.`);
    }

    return this.repository.update({ ...existing, status });
  }
}
