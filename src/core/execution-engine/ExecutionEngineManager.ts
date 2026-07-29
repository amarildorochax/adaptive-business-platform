import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import type { ExecutionRun } from "./ExecutionRun";
import { ExecutionEngineService } from "./ExecutionEngineService";
import { ExecutionEngineMetrics, type ExecutionEngineMetricsSnapshot } from "./ExecutionEngineMetrics";

/**
 * Coordena o ciclo de vida completo de um ExecutionRun (Tarefa 07) —
 * delega a ExecutionEngineService, registra ExecutionEngineMetrics e
 * emite os eventos de ciclo de vida (EXECUTION_STARTED/
 * EXECUTION_COMPLETED/EXECUTION_CANCELLED/EXECUTION_FAILED, Tarefa 09)
 * — todos exclusivamente por este arquivo (Tarefa 14: payload sempre
 * estruturado, mesmo padrão de toda Sprint anterior).
 *
 * `startExecution()` chama `beginRun()` (valida + cria o run
 * `"running"`, emite EXECUTION_STARTED) e, na sequência, `completeRun()`
 * (cria o step, marca tudo `"completed"`, cria o ExecutionResult, emite
 * EXECUTION_COMPLETED) — tudo dentro da mesma chamada síncrona. O
 * caminho `EXECUTION_FAILED` existe estruturalmente (Tarefa 09 exige o
 * evento), mas nunca é alcançado nesta Sprint: como nenhuma ação real é
 * executada, `completeRun()` nunca falha de fato.
 *
 * Consumido exclusivamente por ExecutionEngine (fachada).
 */
export class ExecutionEngineManager {
  private readonly service = new ExecutionEngineService();

  private readonly metrics = new ExecutionEngineMetrics();

  /**
   * Inicia e conclui uma execução para `scheduleId` (Tarefa 07).
   * Retorna `undefined` se o agendamento não existir ou não estiver
   * `"approved"`.
   */
  startExecution(scheduleId: string): ExecutionRun | undefined {
    const run = this.service.beginRun(scheduleId);

    if (!run) {
      return undefined;
    }

    this.metrics.recordRunStarted();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.EXECUTION_STARTED,
      source: "ExecutionEngineManager",
      payload: { runId: run.id, scheduleId: run.scheduleId },
      createdAt: run.startedAt,
    });

    const completion = this.service.completeRun(run.id);

    if (completion) {
      this.metrics.recordCompleted(completion.result.stepsCompleted);

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.EXECUTION_COMPLETED,
        source: "ExecutionEngineManager",
        payload: {
          runId: completion.run.id,
          success: completion.result.success,
          duration: completion.result.duration,
          stepsCompleted: completion.result.stepsCompleted,
        },
        createdAt: completion.run.finishedAt ?? new Date(),
      });

      return completion.run;
    }

    this.metrics.recordFailed();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.EXECUTION_FAILED,
      source: "ExecutionEngineManager",
      payload: { runId: run.id },
      createdAt: new Date(),
    });

    return undefined;
  }

  /** Cancela um ExecutionRun. Retorna `undefined` se não existir ou não estiver mais em andamento. */
  cancelExecution(id: string): ExecutionRun | undefined {
    const cancelled = this.service.cancelRun(id);

    if (cancelled) {
      this.metrics.recordCancelled();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.EXECUTION_CANCELLED,
        source: "ExecutionEngineManager",
        payload: { runId: cancelled.id },
        createdAt: cancelled.finishedAt ?? new Date(),
      });
    }

    return cancelled;
  }

  /** Retorna o ExecutionRun de `id`, ou `undefined` se não existir. Registra consulta. */
  getExecutionRun(id: string): ExecutionRun | undefined {
    this.metrics.recordQuery();
    return this.service.getRun(id);
  }

  /** Retorna todos os ExecutionRun já registrados. Registra consulta. */
  listExecutionRuns(): ExecutionRun[] {
    this.metrics.recordQuery();
    return this.service.listRuns();
  }

  /** Métricas agregadas de uso do Execution Engine. */
  getMetrics(): ExecutionEngineMetricsSnapshot {
    this.metrics.recordQuery();
    const activeRuns = this.service.listRuns().filter((run) => run.status === "running").length;
    return this.metrics.snapshot(activeRuns);
  }
}
