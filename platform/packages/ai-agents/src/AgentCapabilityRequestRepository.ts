import type { AgentCapabilityRequest } from "./AgentCapabilityRequest.js";

/** Agent Capability Request Repository — a solicitação é um fato imutável; nunca `update` nem `remove`. */
export interface AgentCapabilityRequestRepository {
  create(request: AgentCapabilityRequest): Promise<AgentCapabilityRequest>;
  find(agentCapabilityRequestId: string): Promise<AgentCapabilityRequest | undefined>;
}
