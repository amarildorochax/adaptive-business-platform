import type { ExecutionSchedule } from "./ExecutionSchedule";
import { ExecutionSchedulingManager } from "./ExecutionSchedulingManager";
import type { ExecutionSchedulingMetricsSnapshot } from "./ExecutionSchedulingMetrics";

/**
 * Fachada pública única do Execution Scheduling (Tarefa 02).
 *
 * ```
 * Application
 *    ↓
 * ExecutionScheduling.scheduleExecution/approveSchedule/rejectSchedule/
 *                     getSchedule/listSchedules/getMetrics   ← única fachada
 *    ↓
 * ExecutionSchedulingManager   ← coordena; emite eventos; registra métricas
 *    ↓
 * ExecutionSchedulingService     ← registra, valida pré-condições, controla aprovações
 *    ↓ execution.getExecution()
 * ExecutionSchedulingStore
 *    ↓
 * ExecutionSchedule · ApprovalRecord
 * ```
 *
 * Registra agendamentos, controla aprovações e associa cada
 * ExecutionRequest (`@/core/execution`, Sprint 21) a um plano de
 * agendamento — nunca executa nenhuma ação real (ver SchedulerProvider/
 * ApprovalProvider, contratos futuros, Tarefa 08).
 *
 * `approveSchedule()`/`rejectSchedule()` criam automaticamente um
 * ApprovalRecord associado — não há um método separado para isso.
 *
 * Nota de nomenclatura: `SchedulerProvider` (Tarefa 08) colide de nome
 * com `@/core/automations/SchedulerProvider.ts` (Sprint 14, também um
 * contrato futuro nunca implementado, formato de método distinto).
 * Resolvido excluindo `./execution-scheduling` do `export *` de
 * `core/index.ts` — mesmo princípio já usado quatro vezes nesta série
 * (`WorkflowEngine`, `EmailProvider`/`WhatsAppProvider`,
 * `notifications`, `execution`). Este módulo, em si, permanece
 * completo e correto; apenas o barrel de topo não o agrega.
 *
 * Este módulo não consome nenhum outro domínio além de
 * `execution.getExecution()` — nem `ExecutionStore`, nem Automation
 * Center, nem Business Intelligence, nem Analytics, nem Dashboard.
 *
 * Responsabilidade: nenhum consumidor deve importar
 * ExecutionSchedulingManager, ExecutionSchedulingService ou
 * ExecutionSchedulingStore diretamente — todos usam exclusivamente
 * esta fachada.
 *
 * Dependências: ExecutionSchedulingManager.
 */
export class ExecutionScheduling {
  private readonly manager = new ExecutionSchedulingManager();

  /** Registra um novo agendamento para `executionId`. Retorna `undefined` se o ExecutionRequest não existir. */
  scheduleExecution(
    executionId: string,
    scheduledFor: Date,
    metadata: Record<string, unknown> = {},
  ): ExecutionSchedule | undefined {
    return this.manager.scheduleExecution(executionId, scheduledFor, metadata);
  }

  /** Aprova um ExecutionSchedule. */
  approveSchedule(id: string): ExecutionSchedule | undefined {
    return this.manager.approveSchedule(id);
  }

  /** Rejeita um ExecutionSchedule. */
  rejectSchedule(id: string): ExecutionSchedule | undefined {
    return this.manager.rejectSchedule(id);
  }

  /** Recupera um ExecutionSchedule por `id`, ou `undefined` se não existir. */
  getSchedule(id: string): ExecutionSchedule | undefined {
    return this.manager.getSchedule(id);
  }

  /** Retorna todos os ExecutionSchedule já registrados. */
  listSchedules(): ExecutionSchedule[] {
    return this.manager.listSchedules();
  }

  /** Métricas agregadas de uso do Execution Scheduling. */
  getMetrics(): ExecutionSchedulingMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do ExecutionScheduling para toda a plataforma. */
export const executionScheduling = new ExecutionScheduling();
