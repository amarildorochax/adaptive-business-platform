import { BrainCommand, BrainCommandType } from "./OfficeBrain";

export interface CommandContext {
  agentId: string;
  payload?: Record<string, unknown>;
}

export interface CommandSequence {
  commands: BrainCommand[];
}

export class OfficeCommands {
  createIdle(context: CommandContext): CommandSequence {
    return this.wrap(this.createCommand(BrainCommandType.Idle, context));
  }

  createReturnHome(context: CommandContext): CommandSequence {
    return this.wrap(this.createCommand(BrainCommandType.ReturnHome, context));
  }

  createCoffeeBreak(context: CommandContext): CommandSequence {
    return this.merge(
      this.createMove(context),
      this.createWait(context),
      this.createReturnHome(context)
    );
  }

  createMeeting(context: CommandContext): CommandSequence {
    return this.merge(
      this.createMove(context),
      this.createWait(context),
      this.createReturnHome(context)
    );
  }

  createCheckpoint(context: CommandContext): CommandSequence {
    return this.wrap(this.createCommand(BrainCommandType.Checkpoint, context));
  }

  createMove(context: CommandContext): CommandSequence {
    return this.wrap(this.createCommand(BrainCommandType.Move, context));
  }

  createWait(context: CommandContext): CommandSequence {
    return this.wrap(this.createCommand(BrainCommandType.Wait, context));
  }

  createHighlight(context: CommandContext): CommandSequence {
    return this.wrap(this.createCommand(BrainCommandType.Highlight, context));
  }

  createFocus(context: CommandContext): CommandSequence {
    return this.wrap(this.createCommand(BrainCommandType.Focus, context));
  }

  createCelebrate(context: CommandContext): CommandSequence {
    return this.wrap(this.createCommand(BrainCommandType.Celebrate, context));
  }

  createStatus(context: CommandContext): CommandSequence {
    return this.wrap(this.createCommand(BrainCommandType.Status, context));
  }

  createHandoff(context: CommandContext): CommandSequence {
    return this.wrap(this.createCommand(BrainCommandType.Handoff, context));
  }

  createDelivery(context: CommandContext): CommandSequence {
    return this.merge(
      this.createMove(context),
      this.createCheckpoint(context),
      this.createHandoff(context),
      this.createReturnHome(context)
    );
  }

  createReception(context: CommandContext): CommandSequence {
    return this.merge(
      this.createMove(context),
      this.createStatus(context),
      this.createWait(context),
      this.createReturnHome(context)
    );
  }

  createCustom(
    context: CommandContext,
    type: BrainCommandType,
    payload?: Record<string, unknown>
  ): CommandSequence {
    return this.wrap(
      this.createCommand(type, {
        agentId: context.agentId,
        payload: payload ?? context.payload,
      })
    );
  }

  // Helpers

  createCommand(type: BrainCommandType, context: CommandContext): BrainCommand {
    return {
      type,
      agentId: context.agentId,
      payload: context.payload,
    };
  }

  append(sequence: CommandSequence, command: BrainCommand): CommandSequence {
    return { commands: [...sequence.commands, command] };
  }

  merge(...sequences: CommandSequence[]): CommandSequence {
    return { commands: sequences.flatMap((sequence) => sequence.commands) };
  }

  private wrap(command: BrainCommand): CommandSequence {
    return { commands: [command] };
  }
}
