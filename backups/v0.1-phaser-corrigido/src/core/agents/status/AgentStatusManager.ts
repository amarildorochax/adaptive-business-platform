import { AgentRegistry } from "../registry/AgentRegistry";
import { AgentStatus } from "../registry/AgentStatus";

export class AgentStatusManager {
  constructor(private registry: AgentRegistry) {}

  setStatus(agentId: string, status: AgentStatus): boolean {
    const agent = this.registry.get(agentId);

    if (!agent) {
      return false;
    }

    this.registry.updateStatus(agentId, status);

    return true;
  }

  getStatus(agentId: string): AgentStatus | null {
    const agent = this.registry.get(agentId);

    if (!agent) {
      return null;
    }

    return agent.status;
  }

  isWorking(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.WORKING;
  }

  isIdle(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.IDLE;
  }

  isOffline(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.OFFLINE;
  }

  isWaiting(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.WAITING;
  }

  isPaused(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.PAUSED;
  }

  isError(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.ERROR;
  }
}