import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import type { ExecutionSchedule } from "./ExecutionSchedule";
import { ExecutionSchedulingService } from "./ExecutionSchedulingService";
import { ExecutionSchedulingMetrics, type ExecutionSchedulingMetricsSnapshot } from "./ExecutionSchedulingMetrics";

/**
 * Coordena todas as operações do Execution Scheduling (Tarefa 03) —
 * delega registro/aprovação/rejeição/consulta a
 * ExecutionSchedulingService, registra ExecutionSchedulingMetrics e
 * emite os eventos de ciclo de vida (EXECUTION_SCHEDULED/
 * EXECUTION_SCHEDULE_APPROVED/EXECUTION_SCHEDULE_REJECTED, Tarefa 07) —
 * todos exclusivamente por este arquivo.
 *
 * Consumido exclusivamente por ExecutionScheduling (fachada).
 */
export class ExecutionSchedulingManager {
  private readonly service = new ExecutionSchedulingService();

  private readonly metrics = new ExecutionSchedulingMetrics();

  /** Registra um novo agendamento. Retorna `undefined` se `executionId` não existir. */
  scheduleExecution(
    executionId: string,
    scheduledFor: Date,
    metadata: Record<string, unknown>,
  ): ExecutionSchedule | undefined {
    const schedule = this.service.scheduleExecution(executionId, scheduledFor, metadata);

    if (schedule) {
      this.metrics.recordSchedule();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.EXECUTION_SCHEDULED,
        source: "ExecutionSchedulingManager",
        payload: { id: schedule.id, executionId: schedule.executionId, scheduledFor: schedule.scheduledFor },
        createdAt: schedule.createdAt,
      });
    }

    return schedule;
  }

  /** Aprova um ExecutionSchedule. Retorna `undefined` se não existir ou não estiver mais pendente. */
  approveSchedule(id: string): ExecutionSchedule | undefined {
    const approved = this.service.approveSchedule(id);

    if (approved) {
      this.metrics.recordApproval();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.EXECUTION_SCHEDULE_APPROVED,
        source: "ExecutionSchedulingManager",
        payload: { id: approved.id },
        createdAt: new Date(),
      });
    }

    return approved;
  }

  /** Rejeita um ExecutionSchedule. Retorna `undefined` se não existir ou não estiver mais pendente. */
  rejectSchedule(id: string): ExecutionSchedule | undefined {
    const rejected = this.service.rejectSchedule(id);

    if (rejected) {
      this.metrics.recordRejection();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.EXECUTION_SCHEDULE_REJECTED,
        source: "ExecutionSchedulingManager",
        payload: { id: rejected.id },
        createdAt: new Date(),
      });
    }

    return rejected;
  }

  /** Retorna o ExecutionSchedule de `id`, ou `undefined` se não existir. Registra consulta. */
  getSchedule(id: string): ExecutionSchedule | undefined {
    this.metrics.recordQuery();
    return this.service.getSchedule(id);
  }

  /** Retorna todos os ExecutionSchedule já registrados. Registra consulta. */
  listSchedules(): ExecutionSchedule[] {
    this.metrics.recordQuery();
    return this.service.listSchedules();
  }

  /** Métricas agregadas de uso do Execution Scheduling. */
  getMetrics(): ExecutionSchedulingMetricsSnapshot {
    this.metrics.recordQuery();
    return this.metrics.snapshot();
  }
}
