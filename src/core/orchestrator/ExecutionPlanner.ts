import { ExecutionStatus } from "./ExecutionStatus";
import { ExecutionPriority } from "@/core/catalog/ExecutionPriority";
import type { ExecutionPlan } from "./ExecutionPlan";
import type { ExecutionStep } from "./ExecutionStep";
import type { AgentSelector } from "./AgentSelector";

/**
 * Uma etapa desejada, antes de ter um Agent resolvido. Exatamente um
 * dos dois deve ser suficiente para resolver o Agent: `agentId` (forçado
 * diretamente, ex.: por TaskRunner, que já sabe qual Agent quer) ou
 * `taskType` (delegado a AgentSelector.select()).
 */
export interface OrchestrationStepRequest {
  action: string;
  agentId?: string;
  taskType?: string;
}

/** Requisição de orquestração aceita por `AgentOrchestrator.execute()`. */
export interface OrchestrationRequest {
  name: string;
  objective: string;
  steps: OrchestrationStepRequest[];
  priority?: ExecutionPriority;
  metadata?: Record<string, unknown>;
}

/**
 * Constrói um ExecutionPlan a partir de uma OrchestrationRequest,
 * resolvendo o Agent de cada etapa via AgentSelector.
 *
 * Responsabilidade: única lógica de planejamento da plataforma — nunca
 * decide qual Agent executa uma ação por conta própria; delega
 * inteiramente a AgentSelector (Tarefa 06). Este componente aparece na
 * arquitetura desta Sprint ("Execution Planner") sem ter uma Tarefa
 * numerada própria — inferido do diagrama, análogo ao papel que
 * PromptBuilder cumpre para PromptManager: a lógica de montagem
 * separada da fachada pública.
 *
 * Nesta Sprint, o plano é sempre sequencial — a ordem de `steps` já
 * reflete a ordem de execução; nenhuma dependência entre etapas ou
 * execução paralela é considerada (ver ExecutionDependency.ts/
 * ExecutionParallelism.ts, Tarefa 10).
 *
 * Dependências: AgentSelector.
 *
 * Consumido exclusivamente por AgentOrchestrator.
 */
export class ExecutionPlanner {
  constructor(private readonly selector: AgentSelector) {}

  /**
   * Monta o ExecutionPlan — `status: PENDING`, cada ExecutionStep
   * também `PENDING`.
   * @throws {Error} se uma etapa não informar `agentId` nem `taskType`,
   * ou se `taskType` for informado mas AgentSelector não encontrar
   * nenhum Agent disponível para ele.
   */
  plan(request: OrchestrationRequest): ExecutionPlan {
    const now = new Date();

    const steps: ExecutionStep[] = request.steps.map((stepRequest, index) => {
      if (!stepRequest.agentId && !stepRequest.taskType) {
        throw new Error(
          `ExecutionPlanner: a etapa "${stepRequest.action}" precisa informar "agentId" ou "taskType".`
        );
      }

      const agentId =
        stepRequest.agentId ??
        (stepRequest.taskType ? this.selector.select(stepRequest.taskType)?.id : undefined);

      if (!agentId) {
        throw new Error(
          `ExecutionPlanner: nenhum agente disponível para o tipo de tarefa "${stepRequest.taskType}".`
        );
      }

      return {
        id: crypto.randomUUID(),
        order: index,
        agentId,
        action: stepRequest.action,
        status: ExecutionStatus.PENDING,
        createdAt: now,
        updatedAt: now,
      };
    });

    return {
      id: crypto.randomUUID(),
      name: request.name,
      objective: request.objective,
      steps,
      priority: request.priority ?? ExecutionPriority.NORMAL,
      status: ExecutionStatus.PENDING,
      metadata: request.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
  }
}
