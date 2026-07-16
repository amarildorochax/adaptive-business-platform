import { taskQueue } from "../queue/TaskQueue";
import type { Task } from "../queue/Task";
import { AgentStatus } from "../agents/registry/AgentStatus";
import { agentStore } from "../store/AgentStore";
import { agentDispatcher } from "../dispatcher/AgentDispatcher";
import { executionHistory } from "../history/ExecutionHistory";

export class TaskRunner {
  async run(agentId: string): Promise<Task | null> {
    const task = taskQueue.next();

    if (!task) {
      return null;
    }

    task.assignedTo = agentId;

    agentStore.updateStatus(agentId, AgentStatus.WORKING);

    taskQueue.start(task.id);

    const startedAt = new Date();

    try {
      const result = await agentDispatcher.dispatch(agentId, task);

      const finishedAt = new Date();

      executionHistory.add({
        id: crypto.randomUUID(),
        agentId,
        taskId: task.id,
        provider: result.provider,
        status: "SUCCESS",
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
      });

      console.log("[TaskRunner] Tarefa concluída");
      console.log("Provider:", result.provider);
      console.log("Arquivo:", result.fileName);

      taskQueue.complete(task.id);

      agentStore.updateStatus(agentId, AgentStatus.IDLE);

      return task;
    } catch (error) {
      const finishedAt = new Date();

      executionHistory.add({
        id: crypto.randomUUID(),
        agentId,
        taskId: task.id,
        provider: "unknown",
        status: "FAILED",
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
      });

      console.error("[TaskRunner] Erro ao executar tarefa:", error);

      taskQueue.fail(task.id);

      agentStore.updateStatus(agentId, AgentStatus.ERROR);

      return null;
    }
  }
}

export const taskRunner = new TaskRunner();