import { agentStore } from "../store/AgentStore";
import { AgentStatus } from "../agents/registry/AgentStatus";
import { taskRunner } from "../tasks/TaskRunner";

export class AgentSimulator {
  private timer: ReturnType<typeof setInterval> | null = null;

  private readonly sequence: AgentStatus[] = [
    AgentStatus.IDLE,
    AgentStatus.WORKING,
    AgentStatus.WAITING,
    AgentStatus.PAUSED,
  ];

  start(agentId: string, interval = 3000): void {
    let index = 0;

    this.stop();

    this.timer = setInterval(() => {
      const executedTask = taskRunner.run(agentId);

      if (!executedTask) {
        agentStore.updateStatus(agentId, this.sequence[index]);

        index++;

        if (index >= this.sequence.length) {
          index = 0;
        }
      }
    }, interval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}