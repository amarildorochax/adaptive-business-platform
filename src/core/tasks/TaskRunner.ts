import { taskQueue } from "../queue/TaskQueue";
import type { Task } from "../queue/Task";
import { AgentStatus } from "../agents/registry/AgentStatus";
import { agentStore } from "../store/AgentStore";
import { agentOrchestrator } from "../orchestrator/AgentOrchestrator";
import { ExecutionStatus } from "../orchestrator/ExecutionStatus";
import type { BlogExecutionResult } from "../agents/blog/executor/BlogAgentExecutor";
import { executionHistory } from "../history/ExecutionHistory";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";

/**
 * Orquestra a execução de uma única Task pendente por um Agent: retira
 * da fila, marca status (Agent e Task), despacha ao executor, e registra
 * o resultado em ExecutionHistory.
 *
 * Responsabilidade: ser o único ponto que conecta TaskQueue, AgentStore,
 * AgentOrchestrator e ExecutionHistory em um único fluxo. Consumido
 * hoje por AgentSimulator (src/core/simulation/AgentSimulator.ts) e por
 * NewTaskButton, indiretamente através de TaskQueue.add()
 * (src/components/tasks/NewTaskButton.tsx via DashboardLayout).
 *
 * Sprint Agent Orchestrator (Tarefa 09): este runner não chama mais
 * `agentDispatcher.dispatch()` diretamente — passou a chamar
 * exclusivamente `agentOrchestrator.execute()`
 * (src/core/orchestrator/AgentOrchestrator.ts), com um ExecutionPlan de
 * uma única etapa (`agentId`/`action` já conhecidos, sem passar por
 * AgentSelector). O AgentOrchestrator, internamente, ainda usa
 * `agentDispatcher` (inalterado) para de fato executar a etapa — o
 * contrato externo de `TaskRunner.run()` permanece idêntico: mesmo
 * retorno, mesmos registros em ExecutionHistory, mesmos eventos
 * `TASK_STARTED`/`TASK_COMPLETED`/`TASK_FAILED` já emitidos antes desta
 * Sprint — apenas com os eventos `ORCHESTRATION_*`/`STEP_*` adicionais
 * emitidos ao lado, nunca no lugar deles (ver Observability.ts).
 *
 * Dependências: taskQueue, AgentStatus, agentStore, agentOrchestrator,
 * executionHistory, eventBus/EventTypes.
 */
export class TaskRunner {
  /**
   * Executa a próxima Task pendente da fila com o Agent `agentId`.
   * @returns a Task executada com sucesso, ou `null` se não havia Task
   * pendente ou se a execução falhou.
   */
  async run(agentId: string): Promise<Task | null> {
    const task = taskQueue.next();

    if (!task) {
      return null;
    }

    task.assignedTo = agentId;

    agentStore.updateStatus(agentId, AgentStatus.WORKING);

    taskQueue.start(task.id);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.TASK_STARTED,
      source: "TaskRunner",
      payload: { taskId: task.id, agentId, title: task.title },
      createdAt: new Date(),
    });

    const startedAt = new Date();

    try {
      const plan = await agentOrchestrator.execute({
        name: task.title,
        objective: task.description ?? task.title,
        steps: [{ agentId, action: task.title }],
      });

      if (plan.status === ExecutionStatus.FAILED) {
        throw new Error(String(plan.steps[0]?.result ?? "Falha na orquestração."));
      }

      const result = plan.steps[0].result as BlogExecutionResult;

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

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.TASK_COMPLETED,
        source: "TaskRunner",
        payload: {
          taskId: task.id,
          agentId,
          provider: result.provider,
          fileName: result.fileName,
        },
        createdAt: new Date(),
      });

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

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.TASK_FAILED,
        source: "TaskRunner",
        payload: {
          taskId: task.id,
          agentId,
          message: error instanceof Error ? error.message : String(error),
        },
        createdAt: new Date(),
      });

      taskQueue.fail(task.id);

      agentStore.updateStatus(agentId, AgentStatus.ERROR);

      return null;
    }
  }
}

/** Instância única e compartilhada do TaskRunner para toda a plataforma. */
export const taskRunner = new TaskRunner();
