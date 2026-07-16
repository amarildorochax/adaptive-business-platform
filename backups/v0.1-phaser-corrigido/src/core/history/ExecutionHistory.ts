export interface ExecutionRecord {
  id: string;
  agentId: string;
  taskId: string;
  provider: string;
  status: "SUCCESS" | "FAILED";
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
}

export class ExecutionHistory {
  private records: ExecutionRecord[] = [];

  add(record: ExecutionRecord): void {
    this.records.unshift(record);
  }

  getAll(): ExecutionRecord[] {
    return [...this.records];
  }

  clear(): void {
    this.records = [];
  }

  count(): number {
    return this.records.length;
  }
}

export const executionHistory = new ExecutionHistory();