import type { Agent } from "../agents/registry/Agent";
import { AgentStatus } from "../agents/registry/AgentStatus";
import { AgentRegistry } from "../agents/registry/AgentRegistry";
import { registerAgents } from "../agents/registry/registerAgents";
import { AgentStatusManager } from "../agents/status/AgentStatusManager";

type Listener = () => void;

class AgentStore {
  private registry = new AgentRegistry();

  private statusManager: AgentStatusManager;

  private listeners = new Set<Listener>();

  constructor() {
    registerAgents(this.registry);

    this.statusManager = new AgentStatusManager(this.registry);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  getAgents(): Agent[] {
    return this.registry.getAll();
  }

  getAgent(id: string): Agent | undefined {
    return this.registry.get(id);
  }

  totalAgents(): number {
    return this.registry.count();
  }

  updateStatus(id: string, status: AgentStatus): boolean {
    const updated = this.statusManager.setStatus(id, status);

    if (updated) {
      this.notify();
    }

    return updated;
  }

  getStatus(id: string): AgentStatus | null {
    return this.statusManager.getStatus(id);
  }
}

export const agentStore = new AgentStore();