import type { AgentCapabilityRequest } from '../AgentCapabilityRequest';
import type { AgentCapabilityRequestRepository } from '../AgentCapabilityRequestRepository';
import type { AgentDelegationRecord } from '../AgentDelegationRecord';
import type { AgentDelegationRecordRepository } from '../AgentDelegationRecordRepository';
import type { AgentTaskResult } from '../AgentTaskResult';
import type { AgentTaskResultRepository } from '../AgentTaskResultRepository';
import type { OversightCheckpoint } from '../OversightCheckpoint';
import type { OversightCheckpointRepository } from '../OversightCheckpointRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-014, Etapa de Testes). Mesmo padrão já usado
 * pelos treze domínios anteriores desta série — nunca exportados pelo barrel do pacote, nunca
 * referenciados por nenhum Service em produção.
 */

export class FakeAgentCapabilityRequestRepository implements AgentCapabilityRequestRepository {
  private readonly rows = new Map<string, AgentCapabilityRequest>();
  async create(request: AgentCapabilityRequest) {
    this.rows.set(request.agentCapabilityRequestId, request);
    return request;
  }
  async find(agentCapabilityRequestId: string) {
    return this.rows.get(agentCapabilityRequestId);
  }
}

export class FakeAgentDelegationRecordRepository implements AgentDelegationRecordRepository {
  private readonly rows = new Map<string, AgentDelegationRecord>();
  async create(record: AgentDelegationRecord) {
    this.rows.set(record.agentDelegationRecordId, record);
    return record;
  }
  async update(record: AgentDelegationRecord) {
    this.rows.set(record.agentDelegationRecordId, record);
    return record;
  }
  async find(agentDelegationRecordId: string) {
    return this.rows.get(agentDelegationRecordId);
  }
  async listByCapabilityRequestId(agentCapabilityRequestId: string) {
    return [...this.rows.values()].filter((r) => r.agentCapabilityRequestId === agentCapabilityRequestId);
  }
}

export class FakeAgentTaskResultRepository implements AgentTaskResultRepository {
  private readonly rows = new Map<string, AgentTaskResult>();
  async create(result: AgentTaskResult) {
    this.rows.set(result.agentTaskResultId, result);
    return result;
  }
  async find(agentTaskResultId: string) {
    return this.rows.get(agentTaskResultId);
  }
  async listByDelegationRecordId(agentDelegationRecordId: string) {
    return [...this.rows.values()].filter((r) => r.agentDelegationRecordId === agentDelegationRecordId);
  }
}

export class FakeOversightCheckpointRepository implements OversightCheckpointRepository {
  private readonly rows = new Map<string, OversightCheckpoint>();
  async create(checkpoint: OversightCheckpoint) {
    this.rows.set(checkpoint.oversightCheckpointId, checkpoint);
    return checkpoint;
  }
  async update(checkpoint: OversightCheckpoint) {
    this.rows.set(checkpoint.oversightCheckpointId, checkpoint);
    return checkpoint;
  }
  async find(oversightCheckpointId: string) {
    return this.rows.get(oversightCheckpointId);
  }
  async findByTaskResultId(agentTaskResultId: string) {
    return [...this.rows.values()].find((c) => c.agentTaskResultId === agentTaskResultId);
  }
}
