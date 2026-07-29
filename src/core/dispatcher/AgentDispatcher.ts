import type { Task } from "../queue/Task";
import type { BlogExecutionResult } from "../agents/blog/executor/BlogAgentExecutor";
import { blogAgentExecutor } from "../agents/blog/executor/BlogAgentExecutor";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";

/** Contrato mínimo que qualquer executor de Agent precisa satisfazer para ser registrado em AgentDispatcher. */
export interface AgentExecutor {
  execute(task: Task): Promise<BlogExecutionResult>;
}

/**
 * Roteador de execução: dado um `agentId`, encaminha a Task para o
 * executor registrado daquele Agent.
 *
 * Responsabilidade: mapear `agentId` -> executor concreto.
 *
 * Sprint 0B — Integração do Runtime: o `switch` fixo por `agentId` foi
 * eliminado — os executores agora são resolvidos por um registro
 * interno (`Map<string, AgentExecutor>`), mesmo padrão já usado por
 * AgentRegistry/ModuleRegistry/ConnectorRegistry, mas encapsulado
 * dentro do próprio Dispatcher (sem introduzir uma classe de Registry
 * nova). `registerExecutor()` permite adicionar um executor para um
 * novo Agent sem editar nenhum `switch` — hoje apenas "blog-agent" está
 * registrado, seeded no construtor.
 *
 * Dependências: Task (tipo), blogAgentExecutor (único executor
 * registrado hoje), EventBus/EventTypes (emite início/conclusão/falha
 * de execução, consumido por Observability.ts).
 */
export class AgentDispatcher {
  private readonly executors = new Map<string, AgentExecutor>();

  constructor() {
    this.registerExecutor("blog-agent", blogAgentExecutor);
  }

  /** Registra (ou substitui) o executor responsável por `agentId`. */
  registerExecutor(agentId: string, executor: AgentExecutor): void {
    this.executors.set(agentId, executor);
  }

  /**
   * Executa a Task através do executor registrado para `agentId`.
   * @throws {Error} se não houver executor registrado para `agentId`.
   */
  async dispatch(agentId: string, task: Task): Promise<BlogExecutionResult> {
    const executor = this.executors.get(agentId);

    if (!executor) {
      throw new Error(
        `Nenhum executor registrado para o agente "${agentId}".`
      );
    }

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.AGENT_EXECUTION_STARTED,
      source: "AgentDispatcher",
      payload: { agentId, taskId: task.id },
      createdAt: new Date(),
    });

    try {
      const result = await executor.execute(task);

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.AGENT_EXECUTION_COMPLETED,
        source: "AgentDispatcher",
        payload: { agentId, taskId: task.id, provider: result.provider },
        createdAt: new Date(),
      });

      return result;
    } catch (error) {
      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.AGENT_EXECUTION_FAILED,
        source: "AgentDispatcher",
        payload: {
          agentId,
          taskId: task.id,
          message: error instanceof Error ? error.message : String(error),
        },
        createdAt: new Date(),
      });

      throw error;
    }
  }
}

/** Instância única e compartilhada do AgentDispatcher para toda a plataforma. */
export const agentDispatcher = new AgentDispatcher();
