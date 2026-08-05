import type { AgentDelegationRecord, AgentDelegationStatus } from "./AgentDelegationRecord.js";
import type { AgentDelegationRecordRepository } from "./AgentDelegationRecordRepository.js";

/**
 * Delegation Coordinator Service — implementa o "Delegation Coordinator"
 * (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seção 4): "Cria e mantém o Agent Delegation Record de uma
 * solicitação, encaminhando-a ao contrato externo do AI Hub e associando-a ao domínio solicitante,
 * sempre por identificador opaco." As transições abaixo aplicam exatamente a sequência da Seção 6
 * (Requested → Delegated → InProgress → Completed | Failed) — nunca pula nem reordena um estágio
 * (mesma disciplina de guarda de estágio já usada em `ExecutionLifecycleService`, IMP-013).
 */
const ALLOWED_TRANSITIONS: Record<AgentDelegationStatus, readonly AgentDelegationStatus[]> = {
  Requested: ["Delegated"],
  Delegated: ["InProgress", "Failed"],
  InProgress: ["Completed", "Failed"],
  Completed: [],
  Failed: [],
};

export class DelegationCoordinatorService {
  constructor(private readonly repository: AgentDelegationRecordRepository) {}

  async create(agentCapabilityRequestId: string, correlationId?: string): Promise<AgentDelegationRecord> {
    const record: AgentDelegationRecord = {
      agentDelegationRecordId: crypto.randomUUID(),
      agentCapabilityRequestId,
      correlationId,
      status: "Requested",
      delegatedAt: new Date(),
    };
    return this.repository.create(record);
  }

  async advance(agentDelegationRecordId: string, next: AgentDelegationStatus): Promise<AgentDelegationRecord> {
    const current = await this.require(agentDelegationRecordId);

    if (!ALLOWED_TRANSITIONS[current.status].includes(next)) {
      throw new Error(`Transição inválida de "${current.status}" para "${next}" em "${agentDelegationRecordId}".`);
    }

    return this.repository.update({ ...current, status: next });
  }

  async find(agentDelegationRecordId: string): Promise<AgentDelegationRecord | undefined> {
    return this.repository.find(agentDelegationRecordId);
  }

  async listByCapabilityRequestId(agentCapabilityRequestId: string): Promise<readonly AgentDelegationRecord[]> {
    return this.repository.listByCapabilityRequestId(agentCapabilityRequestId);
  }

  private async require(agentDelegationRecordId: string): Promise<AgentDelegationRecord> {
    const record = await this.repository.find(agentDelegationRecordId);
    if (!record) {
      throw new Error(`Agent Delegation Record "${agentDelegationRecordId}" não encontrado.`);
    }
    return record;
  }
}
