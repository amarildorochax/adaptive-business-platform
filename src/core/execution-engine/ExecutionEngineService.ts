import { executionScheduling } from "@/core/execution-scheduling/ExecutionScheduling";
import type { ExecutionRun } from "./ExecutionRun";
import type { ExecutionStep } from "./ExecutionStep";
import type { ExecutionResult } from "./ExecutionResult";
import { ExecutionEngineStore } from "./ExecutionEngineStore";

/** O que `completeRun()` produz — o ExecutionRun já finalizado e seu ExecutionResult correspondente. */
export interface ExecutionCompletion {
  run: ExecutionRun;
  result: ExecutionResult;
}

/**
 * Inicia, registra, acompanha e finaliza ExecutionRun (Tarefa 07) —
 * **nunca executa nada de fato** (Workflow/IA/Provider/notificação/
 * API/webhook/Automation Action — todos fora do escopo desta Sprint).
 *
 * Consulta exclusivamente `executionScheduling.getSchedule()` — nunca
 * `ExecutionSchedulingStore`/`Manager`/`Service`, nunca nenhum Store de
 * outro domínio (Tarefa 03).
 *
 * O fluxo é dividido em três métodos (Tarefa 07):
 * - `beginRun()`: valida o agendamento (precisa existir e ter
 *   `status === "approved"`) e cria o ExecutionRun com
 *   `status: "running"`.
 * - `completeRun()`: cria o(s) ExecutionStep, marca-os `"completed"`,
 *   marca o ExecutionRun `"completed"`, e cria o ExecutionResult.
 * - `cancelRun()`: existe para completude da API (Tarefa 02), mas é
 *   estruturalmente inalcançável nesta Sprint em uso normal — como
 *   `startExecution()` (ver ExecutionEngineManager.ts) executa
 *   `beginRun()` e `completeRun()` em sequência, síncrona e
 *   ininterruptamente, nenhum ExecutionRun permanece `"running"` tempo
 *   suficiente para ser cancelado. Reservado para quando uma execução
 *   real e assíncrona existir (ver contratos futuros, Tarefa 10).
 *
 * Stateless em relação a eventos/métricas — isso é responsabilidade de
 * ExecutionEngineManager.
 *
 * Dependências: ExecutionEngineStore (própria instância).
 *
 * Consumido exclusivamente por ExecutionEngineManager.
 */
export class ExecutionEngineService {
  private readonly store = new ExecutionEngineStore();

  /**
   * Valida `executionScheduling.getSchedule(scheduleId)` (precisa
   * existir e estar `"approved"`) e cria o ExecutionRun correspondente.
   * Retorna `undefined` se a validação falhar.
   */
  beginRun(scheduleId: string): ExecutionRun | undefined {
    const schedule = executionScheduling.getSchedule(scheduleId);

    if (!schedule || schedule.status !== "approved") {
      return undefined;
    }

    const run: ExecutionRun = {
      id: crypto.randomUUID(),
      scheduleId,
      startedAt: new Date(),
      status: "running",
      metadata: {},
    };

    this.store.addRun(run);

    return run;
  }

  /**
   * Cria o ExecutionStep sintético do ExecutionRun de `runId`
   * (ver nota em ExecutionStep.ts), marca-o `"completed"`, marca o
   * ExecutionRun `"completed"`, e cria o ExecutionResult
   * correspondente. Retorna `undefined` se `runId` não existir ou não
   * estiver mais `"running"`.
   */
  completeRun(runId: string): ExecutionCompletion | undefined {
    const existing = this.store.getRun(runId);

    if (!existing || existing.status !== "running") {
      return undefined;
    }

    const step: ExecutionStep = {
      id: crypto.randomUUID(),
      runId,
      actionId: existing.scheduleId,
      order: 1,
      status: "completed",
      metadata: {},
    };

    this.store.addStep(step);

    const finishedAt = new Date();
    const completedRun: ExecutionRun = { ...existing, status: "completed", finishedAt };
    this.store.addRun(completedRun);

    const steps = this.store.getStepsByRun(runId);
    const completedSteps = steps.filter((candidate) => candidate.status === "completed");

    const result: ExecutionResult = {
      id: crypto.randomUUID(),
      runId,
      success: true,
      duration: finishedAt.getTime() - existing.startedAt.getTime(),
      errors: [],
      metadata: {},
      stepsExecuted: steps.length,
      stepsCompleted: completedSteps.length,
      failures: 0,
    };

    this.store.addResult(result);

    return { run: completedRun, result };
  }

  /**
   * Cancela um ExecutionRun — apenas quando `status` ainda for
   * `"running"`. Retorna `undefined` se não existir ou já não estiver
   * mais em andamento (ver nota da classe — inalcançável em uso normal
   * nesta Sprint).
   */
  cancelRun(id: string): ExecutionRun | undefined {
    const existing = this.store.getRun(id);

    if (!existing || existing.status !== "running") {
      return undefined;
    }

    const cancelled: ExecutionRun = { ...existing, status: "cancelled", finishedAt: new Date() };
    this.store.addRun(cancelled);

    return cancelled;
  }

  /** Retorna o ExecutionRun de `id`, ou `undefined` se não existir. */
  getRun(id: string): ExecutionRun | undefined {
    return this.store.getRun(id);
  }

  /** Retorna todos os ExecutionRun já registrados. */
  listRuns(): ExecutionRun[] {
    return this.store.getAllRuns();
  }
}
