import type { AgentDelegationRecord } from "./AgentDelegationRecord.js";

/**
 * Agent Delegation Record Repository — único Repository deste pacote com `update`: uma delegação
 * evolui através dos estágios já nomeados no Blueprint (Seção 6: Requested → Delegated → InProgress →
 * Completed | Failed); nunca `remove`.
 */
export interface AgentDelegationRecordRepository {
  create(record: AgentDelegationRecord): Promise<AgentDelegationRecord>;
  update(record: AgentDelegationRecord): Promise<AgentDelegationRecord>;
  find(agentDelegationRecordId: string): Promise<AgentDelegationRecord | undefined>;
  listByCapabilityRequestId(agentCapabilityRequestId: string): Promise<readonly AgentDelegationRecord[]>;
}
