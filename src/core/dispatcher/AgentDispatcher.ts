import type { Task } from "../queue/Task";
import { blogAgentExecutor } from "../agents/blog/executor/BlogAgentExecutor";

export class AgentDispatcher {
  async dispatch(agentId: string, task: Task) {
    switch (agentId) {
      case "blog-agent":
        return await blogAgentExecutor.execute(task);

      default:
        throw new Error(
          `Nenhum executor registrado para o agente "${agentId}".`
        );
    }
  }
}

export const agentDispatcher = new AgentDispatcher();