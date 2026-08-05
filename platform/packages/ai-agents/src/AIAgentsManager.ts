import type { AgentCapabilityRequest, DelegationRequesterKind } from "./AgentCapabilityRequest.js";
import { AgentCapabilityRequestService } from "./AgentCapabilityRequestService.js";
import type { AgentDelegationRecord } from "./AgentDelegationRecord.js";
import { DelegationCoordinatorService } from "./DelegationCoordinatorService.js";
import type { AgentTaskResult } from "./AgentTaskResult.js";
import { TaskResultHandlerService } from "./TaskResultHandlerService.js";
import type { OversightCheckpoint } from "./OversightCheckpoint.js";
import { OversightGateService } from "./OversightGateService.js";

export interface AIAgentsManagerDependencies {
  readonly capabilityRequests: AgentCapabilityRequestService;
  readonly delegation: DelegationCoordinatorService;
  readonly taskResults: TaskResultHandlerService;
  readonly oversight: OversightGateService;
}

/**
 * Resultado de uma operação de AIAgentsManager. **Nunca tem um campo `command` nem um campo
 * `events`** — `AI_AGENTS_ARCHITECTURE_DEFINITION.md` nunca cataloga Commands nem um Event Map
 * próprio; toda referência a Evento é sempre a um Evento já publicado por outro domínio (Runtime,
 * Automation Engine, ou um Business Hub), nunca um catálogo de propriedade de AI Agents. Mesma
 * ausência já confirmada para AI Hub (IMP-010), IAM (IMP-011), Observability (IMP-012) e Runtime
 * (IMP-013) — quinto domínio consecutivo com esta forma.
 */
export interface AIAgentsOperationResult<TEntity> {
  readonly result: TEntity;
}

/**
 * AIAgentsManager — implementa o "Agent Capability Manager" (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`,
 * Seção 4): "Ponto de entrada único de toda solicitação de capacidade apoiada por Agente... não
 * contém lógica de negócio, de automação, ou de inteligência." Aplica literalmente o fluxo da Seção
 * 12: Agent Capability Request → Delegation Coordinator → contrato externo do AI Hub → Task Result
 * Handler → Oversight Gate (quando aplicável) → Agent Task Result devolvido ao solicitante.
 *
 * `delegate()`/`markInProgress()`/`completeDelegation()`/`failDelegation()` refletem transições
 * explícitas, nunca automáticas — a tecnologia concreta de encaminhamento ao AI Hub nunca é decidida
 * por esta Sprint (mesma disciplina já aplicada a `DispatcherService`, IMP-013); o resultado de cada
 * etapa é sempre fornecido já resolvido pelo chamador.
 */
export class AIAgentsManager {
  constructor(private readonly deps: AIAgentsManagerDependencies) {}

  async requestCapability(
    requesterKind: DelegationRequesterKind,
    purposeDescription: string,
    correlationId?: string,
  ): Promise<AIAgentsOperationResult<{ request: AgentCapabilityRequest; delegation: AgentDelegationRecord }>> {
    const request = await this.deps.capabilityRequests.register(requesterKind, purposeDescription);
    const delegation = await this.deps.delegation.create(request.agentCapabilityRequestId, correlationId);

    return { result: { request, delegation } };
  }

  async delegate(agentDelegationRecordId: string): Promise<AIAgentsOperationResult<AgentDelegationRecord>> {
    const delegation = await this.deps.delegation.advance(agentDelegationRecordId, "Delegated");
    return { result: delegation };
  }

  async markInProgress(agentDelegationRecordId: string): Promise<AIAgentsOperationResult<AgentDelegationRecord>> {
    const delegation = await this.deps.delegation.advance(agentDelegationRecordId, "InProgress");
    return { result: delegation };
  }

  /** Recebe o Agent Task Result, marca a delegação como Completed, e aplica o Oversight Gate quando exigido. */
  async completeDelegation(
    agentDelegationRecordId: string,
    resultDescription: string,
    confidence: number,
    requiresConfirmation: boolean,
  ): Promise<AIAgentsOperationResult<{ delegation: AgentDelegationRecord; result: AgentTaskResult; checkpoint?: OversightCheckpoint }>> {
    const taskResult = await this.deps.taskResults.receive(agentDelegationRecordId, resultDescription, confidence);
    const delegation = await this.deps.delegation.advance(agentDelegationRecordId, "Completed");
    const checkpoint = await this.deps.oversight.evaluate(taskResult.agentTaskResultId, requiresConfirmation);

    return { result: { delegation, result: taskResult, checkpoint } };
  }

  async failDelegation(agentDelegationRecordId: string): Promise<AIAgentsOperationResult<AgentDelegationRecord>> {
    const delegation = await this.deps.delegation.advance(agentDelegationRecordId, "Failed");
    return { result: delegation };
  }

  async approveOversight(oversightCheckpointId: string, resolvedByIdentityId: string): Promise<AIAgentsOperationResult<OversightCheckpoint>> {
    const checkpoint = await this.deps.oversight.approve(oversightCheckpointId, resolvedByIdentityId);
    return { result: checkpoint };
  }

  async denyOversight(oversightCheckpointId: string, resolvedByIdentityId: string): Promise<AIAgentsOperationResult<OversightCheckpoint>> {
    const checkpoint = await this.deps.oversight.deny(oversightCheckpointId, resolvedByIdentityId);
    return { result: checkpoint };
  }

  async isReleased(agentTaskResultId: string): Promise<AIAgentsOperationResult<boolean>> {
    const retained = await this.deps.oversight.isRetained(agentTaskResultId);
    return { result: !retained };
  }
}
