/** Decisão registrada por um ApprovalRecord. */
export type ApprovalDecision = "approved" | "rejected";

/**
 * Registro histórico de uma decisão sobre um ExecutionSchedule (Tarefa
 * 05) — criado automaticamente por `ExecutionSchedulingService.
 * approveSchedule()`/`rejectSchedule()`, nunca separadamente.
 */
export interface ApprovalRecord {
  id: string;

  scheduleId: string;

  decision: ApprovalDecision;

  decidedAt: Date;

  metadata: Record<string, unknown>;
}
