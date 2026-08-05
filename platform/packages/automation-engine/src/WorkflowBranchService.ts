import type { WorkflowBranch } from './WorkflowBranch';
import type { WorkflowBranchRepository } from './WorkflowBranchRepository';

/** WorkflowBranchService — nenhum precedente legado equivalente foi encontrado (o Automation Center legado nunca modela caminho alternativo dentro de uma Rule — apenas uma lista plana de Action). Nenhuma emissão de Evento/Audit aqui. */
export class WorkflowBranchService {
  constructor(private readonly repository: WorkflowBranchRepository) {}

  async add(workflowId: string, conditionId: string, order: number, actionIds: readonly string[]): Promise<WorkflowBranch> {
    const branch: WorkflowBranch = { workflowBranchId: crypto.randomUUID(), workflowId, conditionId, order, actionIds };
    return this.repository.create(branch);
  }

  async list(workflowId: string): Promise<readonly WorkflowBranch[]> {
    const branches = await this.repository.list(workflowId);
    return [...branches].sort((a, b) => a.order - b.order);
  }
}
