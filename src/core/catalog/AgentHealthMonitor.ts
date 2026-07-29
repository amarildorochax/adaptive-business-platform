import type { Event } from "@/core/events/Event";
import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import type { AgentHealth } from "./AgentHealth";

interface StepEventPayload {
  stepId?: string;
  agentId?: string;
}

/**
 * Mantém AgentHealth em memória (Tarefa 05), a partir de eventos já
 * publicados por Agent Orchestrator — nunca alterado, nunca importado
 * diretamente.
 *
 * Responsabilidade: assinar `STEP_STARTED`/`STEP_COMPLETED`/
 * `STEP_FAILED` (já emitidos por `AgentOrchestrator.execute()`, ver
 * `@/core/orchestrator`, inalterado) através do EventBus — o único
 * mecanismo público que permite observar execuções sem tocar em
 * nenhum arquivo daquele módulo. Correlaciona `STEP_STARTED` com o
 * `STEP_COMPLETED`/`STEP_FAILED` seguinte pelo mesmo `stepId` para medir
 * a duração real de cada execução, já que nenhum desses eventos carrega
 * `durationMs` diretamente.
 *
 * Dependências: Event (tipo), EventBus, EventTypes (todos de
 * `@/core/events`, inalterados, cross-cutting — não fazem parte do
 * Agent Orchestrator).
 *
 * Consumido exclusivamente por AgentCatalog.
 */
export class AgentHealthMonitor {
  private readonly health = new Map<string, AgentHealth>();

  private readonly pendingStepStarts = new Map<string, number>();

  constructor() {
    eventBus.subscribe(EventTypes.STEP_STARTED, (event) => this.handleStepStarted(event));
    eventBus.subscribe(EventTypes.STEP_COMPLETED, (event) => this.handleStepFinished(event, true));
    eventBus.subscribe(EventTypes.STEP_FAILED, (event) => this.handleStepFinished(event, false));
  }

  private handleStepStarted(event: Event): void {
    const payload = event.payload as StepEventPayload | undefined;

    if (payload?.stepId) {
      this.pendingStepStarts.set(payload.stepId, Date.now());
    }
  }

  private handleStepFinished(event: Event, success: boolean): void {
    const payload = event.payload as StepEventPayload | undefined;

    if (!payload?.stepId || !payload.agentId) {
      return;
    }

    const startedAtMs = this.pendingStepStarts.get(payload.stepId);
    const durationMs = startedAtMs ? Date.now() - startedAtMs : 0;

    this.pendingStepStarts.delete(payload.stepId);

    this.record(payload.agentId, success, durationMs);
  }

  private record(agentId: string, success: boolean, durationMs: number): void {
    const existing = this.health.get(agentId);

    const totalExecutions = (existing?.totalExecutions ?? 0) + 1;
    const totalFailures = (existing?.totalFailures ?? 0) + (success ? 0 : 1);
    const previousTotalDuration = (existing?.averageDurationMs ?? 0) * (existing?.totalExecutions ?? 0);

    const updated: AgentHealth = {
      agentId,
      available: existing?.available ?? true,
      lastExecutionAt: new Date(),
      totalExecutions,
      totalFailures,
      averageDurationMs: (previousTotalDuration + durationMs) / totalExecutions,
      successRate: (totalExecutions - totalFailures) / totalExecutions,
    };

    this.health.set(agentId, updated);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.AGENT_HEALTH_UPDATED,
      source: "AgentHealthMonitor",
      payload: { agentId, successRate: updated.successRate, averageDurationMs: updated.averageDurationMs },
      createdAt: new Date(),
    });
  }

  /** Retorna a AgentHealth de `agentId`, ou `undefined` se nenhuma execução foi observada ainda. */
  getHealth(agentId: string): AgentHealth | undefined {
    return this.health.get(agentId);
  }

  /** Marca manualmente a disponibilidade de `agentId` (ex.: manutenção) — combinado com AgentStatus em tempo real por AgentCatalog.isAvailable(). */
  setAvailable(agentId: string, available: boolean): void {
    const existing = this.health.get(agentId);

    this.health.set(agentId, {
      agentId,
      available,
      totalExecutions: existing?.totalExecutions ?? 0,
      totalFailures: existing?.totalFailures ?? 0,
      averageDurationMs: existing?.averageDurationMs ?? 0,
      successRate: existing?.successRate ?? 1,
      lastExecutionAt: existing?.lastExecutionAt,
    });
  }
}
