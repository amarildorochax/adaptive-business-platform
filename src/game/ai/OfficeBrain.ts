export enum BrainEventType {
  AgentIdle = "AgentIdle",
  AgentWorking = "AgentWorking",
  AgentDone = "AgentDone",
  AgentCheckpoint = "AgentCheckpoint",
  AgentSelected = "AgentSelected",
  CustomerArrived = "CustomerArrived",
  TaskCreated = "TaskCreated",
  TaskFinished = "TaskFinished",
  HandoffRequested = "HandoffRequested",
  MeetingStarted = "MeetingStarted",
  MeetingFinished = "MeetingFinished",
  CoffeeBreak = "CoffeeBreak",
  Custom = "Custom",
}

export enum BrainCommandType {
  Move = "Move",
  Wait = "Wait",
  Status = "Status",
  Highlight = "Highlight",
  Focus = "Focus",
  Checkpoint = "Checkpoint",
  Handoff = "Handoff",
  ReturnHome = "ReturnHome",
  Celebrate = "Celebrate",
  Idle = "Idle",
}

export interface BrainEvent {
  type: BrainEventType;
  agentId?: string;
  targetAgentId?: string;
  payload?: Record<string, unknown>;
  timestamp: number;
}

export interface BrainContext {
  event: BrainEvent;
  agentId?: string;
  targetAgentId?: string;
  data?: Record<string, unknown>;
}

export interface BrainCommand {
  type: BrainCommandType;
  agentId?: string;
  payload?: Record<string, unknown>;
}

export interface BrainDecision {
  event: BrainEvent;
  commands: BrainCommand[];
}

export class OfficeBrain {
  private history: BrainEvent[] = [];

  constructor() {}

  dispatch(event: BrainEvent): BrainDecision {
    this.history.push(event);
    const context = this.evaluate(event);
    return this.decide(context);
  }

  evaluate(event: BrainEvent): BrainContext {
    return {
      event,
      agentId: event.agentId,
      targetAgentId: event.targetAgentId,
      data: event.payload,
    };
  }

  decide(context: BrainContext): BrainDecision {
    const commands: BrainCommand[] = [];
    const agentId = context.agentId;

    switch (context.event.type) {
      case BrainEventType.AgentIdle:
        commands.push(this.createStatus(agentId, "idle"));
        break;

      case BrainEventType.AgentWorking:
        commands.push(this.createStatus(agentId, "working"));
        break;

      case BrainEventType.AgentDone:
        commands.push(this.createStatus(agentId, "done"));
        commands.push(this.createCommand(BrainCommandType.Celebrate, agentId));
        break;

      case BrainEventType.AgentCheckpoint:
        commands.push(this.createStatus(agentId, "checkpoint"));
        commands.push(this.createCommand(BrainCommandType.Checkpoint, agentId, context.data));
        break;

      case BrainEventType.AgentSelected:
        commands.push(this.createFocus(agentId));
        commands.push(this.createHighlight(agentId));
        break;

      case BrainEventType.CustomerArrived:
        commands.push(this.createFocus(agentId));
        break;

      case BrainEventType.TaskCreated:
        commands.push(this.createCommand(BrainCommandType.Idle, agentId));
        break;

      case BrainEventType.TaskFinished:
        commands.push(this.createCommand(BrainCommandType.ReturnHome, agentId));
        break;

      case BrainEventType.HandoffRequested:
        commands.push(
          this.createCommand(BrainCommandType.Handoff, agentId, {
            targetAgentId: context.targetAgentId,
            ...context.data,
          })
        );
        break;

      case BrainEventType.MeetingStarted:
        commands.push(this.createMove(agentId, context.data));
        break;

      case BrainEventType.MeetingFinished:
        commands.push(this.createCommand(BrainCommandType.ReturnHome, agentId));
        break;

      case BrainEventType.CoffeeBreak:
        commands.push(this.createMove(agentId, context.data));
        commands.push(this.createWait(agentId, 2000));
        break;

      case BrainEventType.Custom:
        commands.push(this.createCommand(BrainCommandType.Idle, agentId, context.data));
        break;
    }

    return { event: context.event, commands };
  }

  clear(): void {
    this.history = [];
  }

  // Helpers

  createCommand(
    type: BrainCommandType,
    agentId?: string,
    payload?: Record<string, unknown>
  ): BrainCommand {
    return { type, agentId, payload };
  }

  createMove(agentId?: string, payload?: Record<string, unknown>): BrainCommand {
    return this.createCommand(BrainCommandType.Move, agentId, payload);
  }

  createWait(agentId?: string, duration?: number): BrainCommand {
    return this.createCommand(BrainCommandType.Wait, agentId, { duration });
  }

  createHighlight(agentId?: string): BrainCommand {
    return this.createCommand(BrainCommandType.Highlight, agentId);
  }

  createFocus(agentId?: string): BrainCommand {
    return this.createCommand(BrainCommandType.Focus, agentId);
  }

  createStatus(agentId?: string, status?: string): BrainCommand {
    return this.createCommand(BrainCommandType.Status, agentId, { status });
  }
}
