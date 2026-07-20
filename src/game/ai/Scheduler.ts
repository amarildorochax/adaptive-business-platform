import { BrainCommand, BrainCommandType } from "./OfficeBrain";

export enum SchedulerStatus {
  Idle = "Idle",
  Running = "Running",
  Paused = "Paused",
  Finished = "Finished",
  Cancelled = "Cancelled",
}

export enum SchedulerPriority {
  Low = "Low",
  Normal = "Normal",
  High = "High",
  Critical = "Critical",
}

export interface ScheduledCommand {
  id: string;
  agentId: string;
  command: BrainCommand;
  createdAt: number;
  priority: SchedulerPriority;
  status: SchedulerStatus;
  delay?: number;
  repeat?: number;
  timeout?: number;
  dependsOn?: string[];
}

export interface AgentQueue {
  agentId: string;
  commands: ScheduledCommand[];
  status: SchedulerStatus;
}

export interface SchedulerState {
  queues: AgentQueue[];
  runningAgentIds: string[];
}

const PRIORITY_ORDER: Record<SchedulerPriority, number> = {
  [SchedulerPriority.Critical]: 0,
  [SchedulerPriority.High]: 1,
  [SchedulerPriority.Normal]: 2,
  [SchedulerPriority.Low]: 3,
};

export class Scheduler {
  private queues = new Map<string, AgentQueue>();
  private running = new Set<string>();
  private sequence = 0;

  constructor() {}

  enqueue(
    agentId: string,
    command: BrainCommand,
    priority: SchedulerPriority = SchedulerPriority.Normal
  ): ScheduledCommand {
    const queue = this.getOrCreateQueue(agentId);
    const scheduled = this.createScheduledCommand(agentId, command, priority);

    queue.commands.push(scheduled);
    this.sortQueue(queue);

    if (queue.status === SchedulerStatus.Finished) {
      queue.status = SchedulerStatus.Idle;
    }

    return scheduled;
  }

  enqueueMany(
    agentId: string,
    commands: BrainCommand[],
    priority: SchedulerPriority = SchedulerPriority.Normal
  ): ScheduledCommand[] {
    return commands.map((command) => this.enqueue(agentId, command, priority));
  }

  next(agentId: string): ScheduledCommand | undefined {
    if (this.running.has(agentId)) return undefined;

    const queue = this.queues.get(agentId);
    if (!queue) return undefined;
    if (queue.status === SchedulerStatus.Paused) return undefined;
    if (queue.status === SchedulerStatus.Cancelled) return undefined;
    if (queue.status === SchedulerStatus.Finished) return undefined;

    const command = queue.commands.find((c) => c.status === SchedulerStatus.Idle);
    if (!command) return undefined;

    command.status = SchedulerStatus.Running;
    queue.status = SchedulerStatus.Running;
    this.running.add(agentId);

    return command;
  }

  peek(agentId: string): ScheduledCommand | undefined {
    const queue = this.queues.get(agentId);
    if (!queue) return undefined;

    return queue.commands.find((c) => c.status === SchedulerStatus.Idle);
  }

  finish(agentId: string, commandId: string): void {
    const queue = this.queues.get(agentId);
    if (!queue) return;

    const command = queue.commands.find((c) => c.id === commandId);
    if (command) command.status = SchedulerStatus.Finished;

    this.running.delete(agentId);

    const hasPending = queue.commands.some((c) => c.status === SchedulerStatus.Idle);
    queue.status = hasPending ? SchedulerStatus.Idle : SchedulerStatus.Finished;
  }

  cancel(agentId: string, commandId?: string): void {
    const queue = this.queues.get(agentId);
    if (!queue) return;

    if (commandId) {
      const command = queue.commands.find((c) => c.id === commandId);
      if (command) command.status = SchedulerStatus.Cancelled;
      return;
    }

    for (const command of queue.commands) {
      command.status = SchedulerStatus.Cancelled;
    }

    queue.status = SchedulerStatus.Cancelled;
    this.running.delete(agentId);
  }

  clear(): void {
    this.queues.clear();
    this.running.clear();
  }

  clearAgent(agentId: string): void {
    this.queues.delete(agentId);
    this.running.delete(agentId);
  }

  pause(agentId: string): void {
    const queue = this.queues.get(agentId);
    if (!queue) return;

    queue.status = SchedulerStatus.Paused;
  }

  resume(agentId: string): void {
    const queue = this.queues.get(agentId);
    if (!queue) return;
    if (queue.status !== SchedulerStatus.Paused) return;

    const hasPending = queue.commands.some((c) => c.status === SchedulerStatus.Idle);
    queue.status = hasPending ? SchedulerStatus.Idle : SchedulerStatus.Finished;
  }

  isRunning(agentId: string): boolean {
    return this.running.has(agentId);
  }

  hasQueue(agentId: string): boolean {
    return this.queues.has(agentId);
  }

  hasPending(agentId: string): boolean {
    const queue = this.queues.get(agentId);
    if (!queue) return false;

    return queue.commands.some((c) => c.status === SchedulerStatus.Idle);
  }

  queueSize(agentId: string): number {
    const queue = this.queues.get(agentId);
    if (!queue) return 0;

    return queue.commands.filter((c) => c.status === SchedulerStatus.Idle).length;
  }

  getQueue(agentId: string): AgentQueue | undefined {
    return this.queues.get(agentId);
  }

  hasCommandOfType(agentId: string, type: BrainCommandType): boolean {
    const queue = this.queues.get(agentId);
    if (!queue) return false;

    return queue.commands.some(
      (c) => c.status === SchedulerStatus.Idle && c.command.type === type
    );
  }

  getState(): SchedulerState {
    return {
      queues: [...this.queues.values()],
      runningAgentIds: [...this.running.values()],
    };
  }

  // Helpers

  createScheduledCommand(
    agentId: string,
    command: BrainCommand,
    priority: SchedulerPriority
  ): ScheduledCommand {
    return {
      id: this.generateId(),
      agentId,
      command,
      createdAt: Date.now(),
      priority,
      status: SchedulerStatus.Idle,
    };
  }

  sortQueue(queue: AgentQueue): void {
    queue.commands.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }

  private getOrCreateQueue(agentId: string): AgentQueue {
    let queue = this.queues.get(agentId);

    if (!queue) {
      queue = { agentId, commands: [], status: SchedulerStatus.Idle };
      this.queues.set(agentId, queue);
    }

    return queue;
  }

  private generateId(): string {
    this.sequence += 1;
    return `cmd-${this.sequence}`;
  }
}
