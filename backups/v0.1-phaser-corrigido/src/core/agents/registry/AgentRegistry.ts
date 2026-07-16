import type { Agent } from "./Agent";

export class AgentRegistry {
  private agents = new Map<string, Agent>();

  register(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  unregister(id: string): void {
    this.agents.delete(id);
  }

  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAll(): Agent[] {
    return Array.from(this.agents.values());
  }

  updateStatus(id: string, status: Agent["status"]): void {
    const agent = this.agents.get(id);

    if (!agent) return;

    agent.status = status;
    agent.updatedAt = new Date();
  }

  clear(): void {
    this.agents.clear();
  }

  count(): number {
    return this.agents.size;
  }
}