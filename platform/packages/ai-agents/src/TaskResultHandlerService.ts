import type { AgentTaskResult } from "./AgentTaskResult.js";
import type { AgentTaskResultRepository } from "./AgentTaskResultRepository.js";

/**
 * Task Result Handler Service — implementa o "Task Result Handler"
 * (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seção 4): "Recebe o resultado estruturado retornado pelo
 * AI Hub e o expõe ao domínio solicitante como Agent Task Result — nunca reinterpretando, expandindo,
 * ou validando semanticamente esse resultado." `resultDescription` e `confidence` são recebidos e
 * persistidos exatamente como fornecidos, sem nenhuma lógica de interpretação.
 */
export class TaskResultHandlerService {
  constructor(private readonly repository: AgentTaskResultRepository) {}

  async receive(agentDelegationRecordId: string, resultDescription: string, confidence: number): Promise<AgentTaskResult> {
    const result: AgentTaskResult = {
      agentTaskResultId: crypto.randomUUID(),
      agentDelegationRecordId,
      resultDescription,
      confidence,
      producedAt: new Date(),
    };
    return this.repository.create(result);
  }

  async find(agentTaskResultId: string): Promise<AgentTaskResult | undefined> {
    return this.repository.find(agentTaskResultId);
  }

  async listByDelegationRecordId(agentDelegationRecordId: string): Promise<readonly AgentTaskResult[]> {
    return this.repository.listByDelegationRecordId(agentDelegationRecordId);
  }
}
