import type { Task } from "@/core/queue/Task";
import { TaskStatus } from "@/core/queue/TaskStatus";
import { agentDispatcher } from "@/core/dispatcher/AgentDispatcher";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";
import { ExecutionStatus } from "./ExecutionStatus";
import type { ExecutionPlan } from "./ExecutionPlan";
import { ExecutionContext } from "./ExecutionContext";
import { AgentSelector } from "./AgentSelector";
import { ExecutionPlanner, type OrchestrationRequest } from "./ExecutionPlanner";
import { OrchestratorMetrics, type OrchestratorMetricsSnapshot } from "./OrchestratorMetrics";

/**
 * Fachada pública única do Agent Orchestrator (Tarefa 01).
 *
 * ```
 * Application
 *    ↓
 * AgentOrchestrator.execute(request)   ← único ponto de entrada
 *    ↓
 * ExecutionPlanner.plan(request)       ← resolve Agent de cada etapa via AgentSelector
 *    ↓
 * ExecutionContext                     ← criado uma vez por execução, nunca compartilhado entre Agents diretamente
 *    ↓ (por etapa, em ordem)
 * AgentDispatcher.dispatch(agentId, task)   ← já existente, inalterado — resolve o executor do Agent
 *    ↓ (para "blog-agent", já existente, inalterado)
 * BlogAgentExecutor → PromptManager → ContextBuilder → BusinessMemory → AIGateway
 * ```
 *
 * Responsabilidade: nenhum Agent deve chamar outro Agent diretamente —
 * toda coordenação entre múltiplas etapas passa exclusivamente por
 * aqui. Reutiliza `AgentDispatcher` já existente (inalterado) para de
 * fato executar cada etapa — o Orchestrator nunca invoca
 * `BlogAgentExecutor` ou qualquer executor concreto diretamente, apenas
 * por `agentId` através de `AgentDispatcher`, exatamente como já é
 * feito por `TaskRunner` (Sprint 0B) — dois consumidores independentes
 * do mesmo `AgentDispatcher`, nenhum conhece o outro.
 *
 * Runtime, BootPipeline, AI Gateway, Business Memory, Prompt Manager, e
 * Modules permanecem inteiramente inalterados — consumidos apenas
 * transitivamente, através de `AgentDispatcher`.
 *
 * Dependências: ExecutionPlanner, AgentSelector, OrchestratorMetrics,
 * ExecutionContext, `agentDispatcher` (público, inalterado),
 * EventBus/EventTypes.
 *
 * Exemplo de uso:
 * ```ts
 * const plan = await agentOrchestrator.execute({
 *   name: "Publicar artigo",
 *   objective: "Gerar um artigo de blog sobre X",
 *   steps: [{ taskType: "blog", action: "Escrever artigo sobre X" }],
 * });
 * console.log(plan.status, plan.steps[0].result);
 * ```
 */
export class AgentOrchestrator {
  private readonly selector = new AgentSelector();

  private readonly planner = new ExecutionPlanner(this.selector);

  private readonly metrics = new OrchestratorMetrics();

  private readonly executions = new Map<string, ExecutionPlan>();

  /**
   * Planeja e executa uma orquestração completa, do início ao fim,
   * etapa por etapa, em ordem sequencial.
   * @throws {Error} se ExecutionPlanner não conseguir resolver um
   * Agent para alguma etapa (nenhum Agent disponível para o `taskType`
   * pedido).
   */
  async execute(request: OrchestrationRequest): Promise<ExecutionPlan> {
    const plan = this.planner.plan(request);

    this.executions.set(plan.id, plan);

    const context = new ExecutionContext(plan.id, crypto.randomUUID());

    plan.status = ExecutionStatus.RUNNING;

    const startedAt = Date.now();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.ORCHESTRATION_STARTED,
      source: "AgentOrchestrator",
      payload: { planId: plan.id, name: plan.name, steps: plan.steps.length },
      createdAt: new Date(),
    });

    let anyStepFailed = false;

    for (const step of plan.steps) {
      step.status = ExecutionStatus.RUNNING;
      step.updatedAt = new Date();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.STEP_STARTED,
        source: "AgentOrchestrator",
        payload: { planId: plan.id, stepId: step.id, agentId: step.agentId, action: step.action },
        createdAt: new Date(),
      });

      const task: Task = {
        id: crypto.randomUUID(),
        title: step.action,
        description: request.objective,
        createdBy: "agent-orchestrator",
        status: TaskStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        const result = await agentDispatcher.dispatch(step.agentId, task);

        step.status = ExecutionStatus.COMPLETED;
        step.result = result;
        step.updatedAt = new Date();

        context.set(`step:${step.order}:result`, result);

        eventBus.emit({
          id: crypto.randomUUID(),
          type: EventTypes.STEP_COMPLETED,
          source: "AgentOrchestrator",
          payload: { planId: plan.id, stepId: step.id, agentId: step.agentId },
          createdAt: new Date(),
        });
      } catch (error) {
        anyStepFailed = true;

        const message = error instanceof Error ? error.message : String(error);

        step.status = ExecutionStatus.FAILED;
        step.result = message;
        step.updatedAt = new Date();

        eventBus.emit({
          id: crypto.randomUUID(),
          type: EventTypes.STEP_FAILED,
          source: "AgentOrchestrator",
          payload: { planId: plan.id, stepId: step.id, agentId: step.agentId, message },
          createdAt: new Date(),
        });
      }
    }

    plan.status = anyStepFailed ? ExecutionStatus.FAILED : ExecutionStatus.COMPLETED;
    plan.updatedAt = new Date();

    const durationMs = Date.now() - startedAt;

    this.metrics.recordExecution({
      durationMs,
      stepCount: plan.steps.length,
      agentIds: plan.steps.map((step) => step.agentId),
      failed: anyStepFailed,
    });

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.ORCHESTRATION_COMPLETED,
      source: "AgentOrchestrator",
      payload: { planId: plan.id, status: plan.status, durationMs },
      createdAt: new Date(),
    });

    return plan;
  }

  /** Localiza uma execução já registrada por `id` (Tarefa 01 — registrar execuções). */
  getExecution(id: string): ExecutionPlan | undefined {
    return this.executions.get(id);
  }

  /** Lista todas as execuções já registradas. */
  listExecutions(): ExecutionPlan[] {
    return Array.from(this.executions.values());
  }

  /** Declara a capacidade de um novo Agent — repassado a AgentSelector. */
  registerAgentCapability(...args: Parameters<AgentSelector["registerCapability"]>): void {
    this.selector.registerCapability(...args);
  }

  /** Métricas agregadas de uso do Agent Orchestrator (Tarefa 08). */
  getMetrics(): OrchestratorMetricsSnapshot {
    return this.metrics.snapshot();
  }
}

/** Instância única e compartilhada do AgentOrchestrator para toda a plataforma. */
export const agentOrchestrator = new AgentOrchestrator();
