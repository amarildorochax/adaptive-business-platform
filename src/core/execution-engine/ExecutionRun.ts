/** Estados de um ExecutionRun — espelha os quatro eventos de ciclo de vida (Tarefa 09). */
export type ExecutionRunStatus = "running" | "completed" | "cancelled" | "failed";

/**
 * Uma execução em andamento (ou já concluída) de um ExecutionSchedule
 * já aprovado (Tarefa 04). `scheduleId` é validado contra
 * `executionScheduling.getSchedule()` no momento da criação — um
 * ExecutionRun nunca existe para um `scheduleId` inexistente, nem para
 * um agendamento cujo `status` não seja `"approved"`.
 *
 * Nesta Sprint, `startExecution()` é inteiramente síncrono (nenhuma
 * ação real é executada) — um ExecutionRun nasce, é preenchido e já
 * termina `"completed"` dentro da mesma chamada (ver
 * ExecutionEngineService.ts). `finishedAt` só é preenchida quando o
 * `status` deixa de ser `"running"`.
 */
export interface ExecutionRun {
  id: string;

  scheduleId: string;

  startedAt: Date;

  finishedAt?: Date;

  status: ExecutionRunStatus;

  metadata: Record<string, unknown>;
}
