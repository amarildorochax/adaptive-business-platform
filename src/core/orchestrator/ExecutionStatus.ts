/** Estados possíveis de um ExecutionPlan ou de um ExecutionStep. */
export enum ExecutionStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}
