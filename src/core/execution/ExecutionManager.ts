import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import type { ExecutionRequest } from "./ExecutionRequest";
import { ExecutionService } from "./ExecutionService";
import { ExecutionMetrics, type ExecutionMetricsSnapshot } from "./ExecutionMetrics";

/**
 * Coordena todas as operações do Execution Orchestrator (Tarefa 03) —
 * delega registro/cancelamento/aprovação/consulta a ExecutionService,
 * registra ExecutionMetrics e emite os eventos de ciclo de vida
 * (EXECUTION_REQUESTED/EXECUTION_CANCELLED/EXECUTION_APPROVED, Tarefa
 * 08) — todos exclusivamente por este arquivo.
 *
 * Consumido exclusivamente por Execution (fachada).
 */
export class ExecutionManager {
  private readonly service = new ExecutionService();

  private readonly metrics = new ExecutionMetrics();

  /** Registra uma nova solicitação de execução. Retorna `undefined` se `ruleId` não existir. */
  requestExecution(ruleId: string, metadata: Record<string, unknown>): ExecutionRequest | undefined {
    const request = this.service.requestExecution(ruleId, metadata);

    if (request) {
      this.metrics.recordRequest();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.EXECUTION_REQUESTED,
        source: "ExecutionManager",
        payload: { id: request.id, ruleId: request.ruleId },
        createdAt: request.requestedAt,
      });
    }

    return request;
  }

  /** Cancela um ExecutionRequest. Retorna `undefined` se não existir ou não puder mais ser cancelado. */
  cancelExecution(id: string): ExecutionRequest | undefined {
    const cancelled = this.service.cancelExecution(id);

    if (cancelled) {
      this.metrics.recordCancellation();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.EXECUTION_CANCELLED,
        source: "ExecutionManager",
        payload: { id: cancelled.id },
        createdAt: new Date(),
      });
    }

    return cancelled;
  }

  /** Aprova um ExecutionRequest. Retorna `undefined` se não existir ou não estiver mais pendente. */
  approveExecution(id: string): ExecutionRequest | undefined {
    const approved = this.service.approveExecution(id);

    if (approved) {
      this.metrics.recordApproval();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.EXECUTION_APPROVED,
        source: "ExecutionManager",
        payload: { id: approved.id },
        createdAt: new Date(),
      });
    }

    return approved;
  }

  /** Retorna o ExecutionRequest de `id`, ou `undefined` se não existir. Registra consulta. */
  getExecution(id: string): ExecutionRequest | undefined {
    this.metrics.recordQuery();
    return this.service.getExecution(id);
  }

  /** Retorna todos os ExecutionRequest já registrados. Registra consulta. */
  listExecutions(): ExecutionRequest[] {
    this.metrics.recordQuery();
    return this.service.listExecutions();
  }

  /** Métricas agregadas de uso do Execution Orchestrator. */
  getMetrics(): ExecutionMetricsSnapshot {
    this.metrics.recordQuery();
    return this.metrics.snapshot();
  }
}
