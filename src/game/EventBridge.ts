import type { Agent, AgentStatus, SquadStatus } from "@/types/state";

type EventMap = {
  "squad-changed": [agents: Agent[], squadStatus: SquadStatus];
  "agent-updated": [agentId: string, status: AgentStatus, deliverTo: string | null];
  "handoff": [from: Agent, to: Agent, message: string];
  "squad-cleared": [];
  "scene-ready": [];
};

type EventKey = keyof EventMap;

class GameEventBus {
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  on<K extends EventKey>(event: K, fn: (...args: EventMap[K]) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    const set = this.listeners.get(event)!;
    set.add(fn as (...args: unknown[]) => void);
    return () => set.delete(fn as (...args: unknown[]) => void);
  }

  emit<K extends EventKey>(event: K, ...args: EventMap[K]) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of set) fn(...(args as unknown[]));
  }

  clear() {
    this.listeners.clear();
  }
}

export const eventBridge = new GameEventBus();
