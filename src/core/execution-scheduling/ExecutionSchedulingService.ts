import { execution } from "@/core/execution/Execution";
import type { ExecutionSchedule } from "./ExecutionSchedule";
import type { ApprovalRecord } from "./ApprovalRecord";
import { ExecutionSchedulingStore } from "./ExecutionSchedulingStore";

/**
 * Registra agendamentos, controla aprovações e associa cada
 * ExecutionRequest a um plano de agendamento (Tarefa 03) — **nunca
 * executa nada de fato** (REGRA: "nenhuma execução real").
 *
 * Consulta exclusivamente `execution.getExecution()` — nunca
 * `ExecutionManager`/`ExecutionService`/`ExecutionStore`. A
 * pré-condição validada por `scheduleExecution()` é simples: o
 * `executionId` informado precisa corresponder a um ExecutionRequest já
 * existente — se não existir, nenhum ExecutionSchedule é criado.
 *
 * `approveSchedule()`/`rejectSchedule()` só têm efeito quando
 * `status === "pending"` — criam também, automaticamente, um
 * ApprovalRecord associado.
 *
 * Stateless em relação a eventos/métricas — isso é responsabilidade de
 * ExecutionSchedulingManager.
 *
 * Dependências: ExecutionSchedulingStore (própria instância).
 *
 * Consumido exclusivamente por ExecutionSchedulingManager.
 */
export class ExecutionSchedulingService {
  private readonly store = new ExecutionSchedulingStore();

  /**
   * Registra um novo ExecutionSchedule para `executionId`, já validando
   * que o ExecutionRequest existe. Retorna `undefined` se não existir.
   */
  scheduleExecution(
    executionId: string,
    scheduledFor: Date,
    metadata: Record<string, unknown>,
  ): ExecutionSchedule | undefined {
    const executionRequest = execution.getExecution(executionId);

    if (!executionRequest) {
      return undefined;
    }

    const schedule: ExecutionSchedule = {
      id: crypto.randomUUID(),
      executionId,
      scheduledFor,
      status: "pending",
      createdAt: new Date(),
      metadata,
    };

    this.store.addSchedule(schedule);

    return schedule;
  }

  /**
   * Aprova um ExecutionSchedule — apenas quando `status` ainda for
   * `"pending"` — e registra o ApprovalRecord correspondente. Retorna
   * `undefined` se não existir ou não estiver mais pendente.
   */
  approveSchedule(id: string): ExecutionSchedule | undefined {
    const existing = this.store.getSchedule(id);

    if (!existing || existing.status !== "pending") {
      return undefined;
    }

    const updated: ExecutionSchedule = { ...existing, status: "approved" };
    this.store.addSchedule(updated);

    const approval: ApprovalRecord = {
      id: crypto.randomUUID(),
      scheduleId: id,
      decision: "approved",
      decidedAt: new Date(),
      metadata: {},
    };
    this.store.addApproval(approval);

    return updated;
  }

  /**
   * Rejeita um ExecutionSchedule — apenas quando `status` ainda for
   * `"pending"` — e registra o ApprovalRecord correspondente. Retorna
   * `undefined` se não existir ou não estiver mais pendente.
   */
  rejectSchedule(id: string): ExecutionSchedule | undefined {
    const existing = this.store.getSchedule(id);

    if (!existing || existing.status !== "pending") {
      return undefined;
    }

    const updated: ExecutionSchedule = { ...existing, status: "rejected" };
    this.store.addSchedule(updated);

    const approval: ApprovalRecord = {
      id: crypto.randomUUID(),
      scheduleId: id,
      decision: "rejected",
      decidedAt: new Date(),
      metadata: {},
    };
    this.store.addApproval(approval);

    return updated;
  }

  /** Retorna o ExecutionSchedule de `id`, ou `undefined` se não existir. */
  getSchedule(id: string): ExecutionSchedule | undefined {
    return this.store.getSchedule(id);
  }

  /** Retorna todos os ExecutionSchedule já registrados. */
  listSchedules(): ExecutionSchedule[] {
    return this.store.getAllSchedules();
  }
}
