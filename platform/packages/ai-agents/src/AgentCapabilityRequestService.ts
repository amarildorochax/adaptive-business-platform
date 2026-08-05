import type { AgentCapabilityRequest, DelegationRequesterKind } from "./AgentCapabilityRequest.js";
import type { AgentCapabilityRequestRepository } from "./AgentCapabilityRequestRepository.js";

/**
 * Agent Capability Request Service — suporte de registro para o "Agent Capability Manager"
 * (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seção 4): "Ponto de entrada único de toda solicitação de
 * capacidade apoiada por Agente... não contém lógica de negócio." `purposeDescription` nunca é
 * interpretado aqui — permanece opaco, mesma disciplina do próprio contrato.
 */
export class AgentCapabilityRequestService {
  constructor(private readonly repository: AgentCapabilityRequestRepository) {}

  async register(requesterKind: DelegationRequesterKind, purposeDescription: string): Promise<AgentCapabilityRequest> {
    const request: AgentCapabilityRequest = {
      agentCapabilityRequestId: crypto.randomUUID(),
      requesterKind,
      purposeDescription,
      requestedAt: new Date(),
    };
    return this.repository.create(request);
  }

  async find(agentCapabilityRequestId: string): Promise<AgentCapabilityRequest | undefined> {
    return this.repository.find(agentCapabilityRequestId);
  }
}
