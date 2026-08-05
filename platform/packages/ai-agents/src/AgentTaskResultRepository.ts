import type { AgentTaskResult } from "./AgentTaskResult.js";

/** Agent Task Result Repository — o resultado é um fato imutável; nunca `update` nem `remove`. */
export interface AgentTaskResultRepository {
  create(result: AgentTaskResult): Promise<AgentTaskResult>;
  find(agentTaskResultId: string): Promise<AgentTaskResult | undefined>;
  listByDelegationRecordId(agentDelegationRecordId: string): Promise<readonly AgentTaskResult[]>;
}
