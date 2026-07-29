import { agentStore } from "../store/AgentStore";
import { AgentStatus } from "../agents/registry/AgentStatus";
import { taskRunner } from "../tasks/TaskRunner";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";

const STATUS_EVENT: Record<AgentStatus, string> = {
  [AgentStatus.OFFLINE]: EventTypes.AGENT_OFFLINE,
  [AgentStatus.IDLE]: EventTypes.AGENT_IDLE,
  [AgentStatus.WORKING]: EventTypes.AGENT_BUSY,
  [AgentStatus.WAITING]: EventTypes.AGENT_BUSY,
  [AgentStatus.PAUSED]: EventTypes.AGENT_BUSY,
  [AgentStatus.ERROR]: EventTypes.AGENT_OFFLINE,
};

/**
 * Laço periódico que tenta executar uma Task pendente para um Agent e,
 * na ausência de Task, alterna seu status por uma sequência de
 * demonstração (IDLE -> WORKING -> WAITING -> PAUSED -> IDLE...).
 *
 * Responsabilidade: dar vida visual ao Agent na UI mesmo sem Task real
 * na fila — chamado por PlatformRuntime ao entrar em RUNNING (ver
 * PlatformRuntime.start()), o próprio bootstrap oficial da plataforma.
 *
 * Sprint 0B — Integração do Runtime: `taskRunner.run(agentId)` agora é
 * aguardado corretamente (`await`) — antes desta Sprint, a Promise
 * nunca era aguardada, então `!executedTask` avaliava sempre contra a
 * própria Promise (sempre "truthy"), e a alternância de status jamais
 * executava em tempo real (já registrado como débito técnico na Sprint
 * 0A). Corrigido: o callback do `setInterval` agora é `async`, e a
 * alternância de status volta a ocorrer sempre que não há Task
 * pendente. Cada mudança de status emite o EventType correspondente
 * (AGENT_IDLE/AGENT_BUSY/AGENT_OFFLINE), consumido por Observability.ts.
 *
 * Dependências: agentStore, AgentStatus, taskRunner, eventBus/EventTypes.
 *
 * Exemplo de uso:
 * ```ts
 * const simulator = new AgentSimulator();
 * simulator.start("blog-agent"); // a cada 3s (padrão)
 * simulator.stop();
 * ```
 */
export class AgentSimulator {
  private timer: ReturnType<typeof setInterval> | null = null;

  private readonly sequence: AgentStatus[] = [
    AgentStatus.IDLE,
    AgentStatus.WORKING,
    AgentStatus.WAITING,
    AgentStatus.PAUSED,
  ];

  /**
   * Inicia o laço para `agentId`, a cada `interval` ms (padrão 3000).
   * Interrompe um laço já em andamento antes de iniciar um novo
   * (idempotente por instância).
   */
  start(agentId: string, interval = 3000): void {
    let index = 0;

    this.stop();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.AGENT_ONLINE,
      source: "AgentSimulator",
      payload: { agentId },
      createdAt: new Date(),
    });

    this.timer = setInterval(async () => {
      const executedTask = await taskRunner.run(agentId);

      if (!executedTask) {
        const status = this.sequence[index];

        agentStore.updateStatus(agentId, status);

        eventBus.emit({
          id: crypto.randomUUID(),
          type: STATUS_EVENT[status],
          source: "AgentSimulator",
          payload: { agentId, status },
          createdAt: new Date(),
        });

        index++;

        if (index >= this.sequence.length) {
          index = 0;
        }
      }
    }, interval);
  }

  /** Interrompe o laço, se estiver em andamento. Seguro chamar mais de uma vez. */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
