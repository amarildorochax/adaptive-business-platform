/** Estados possíveis de uma Task, geridos exclusivamente por TaskQueue. */
export enum TaskStatus {
  PENDING = "pending",

  ASSIGNED = "assigned",

  RUNNING = "running",

  COMPLETED = "completed",

  FAILED = "failed",

  CANCELLED = "cancelled",
}
