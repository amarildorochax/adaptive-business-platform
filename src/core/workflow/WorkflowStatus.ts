/** Estados possíveis de um WorkflowPlan ou de um WorkflowStep. */
export enum WorkflowStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}
