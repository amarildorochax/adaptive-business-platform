/** Estados de um ExecutionSchedule (espelha os três métodos de decisão da fachada: scheduleExecution/approveSchedule/rejectSchedule). */
export type ExecutionScheduleStatus = "pending" | "approved" | "rejected";

/**
 * Um agendamento de execução — associa um ExecutionRequest já existente
 * (`@/core/execution`, Sprint 21) a uma data/hora pretendida (Tarefa
 * 04). `executionId` é validado contra `execution.getExecution()` no
 * momento da criação — um ExecutionSchedule nunca existe para um
 * `executionId` inexistente.
 */
export interface ExecutionSchedule {
  id: string;

  executionId: string;

  scheduledFor: Date;

  status: ExecutionScheduleStatus;

  createdAt: Date;

  metadata: Record<string, unknown>;
}
