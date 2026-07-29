import { AgentRegistry } from "../registry/AgentRegistry";
import { AgentStatus } from "../registry/AgentStatus";

/**
 * Consulta e alteração de status de um Agent já registrado, sobre um
 * AgentRegistry existente.
 *
 * Responsabilidade: concentrar a leitura/escrita de AgentStatus e os
 * predicados de conveniência (`isWorking`, `isIdle`, etc.), em vez de
 * cada consumidor comparar `agent.status === AgentStatus.X` diretamente.
 *
 * Objetivo: usado por AgentStore (src/core/store/AgentStore.ts) como a
 * camada de status por trás de `updateStatus()`/`getStatus()`.
 *
 * Dependências: AgentRegistry, AgentStatus (mesmo submódulo agents).
 *
 * Exemplo de uso:
 * ```ts
 * const manager = new AgentStatusManager(registry);
 * manager.setStatus("blog-agent", AgentStatus.WORKING);
 * manager.isWorking("blog-agent"); // true
 * ```
 */
export class AgentStatusManager {
  constructor(private registry: AgentRegistry) {}

  /**
   * Define o status do Agent de `agentId`. Retorna `false` sem efeito
   * se o Agent não estiver registrado.
   */
  setStatus(agentId: string, status: AgentStatus): boolean {
    const agent = this.registry.get(agentId);

    if (!agent) {
      return false;
    }

    this.registry.updateStatus(agentId, status);

    return true;
  }

  /** Retorna o status atual do Agent de `agentId`, ou `null` se não estiver registrado. */
  getStatus(agentId: string): AgentStatus | null {
    const agent = this.registry.get(agentId);

    if (!agent) {
      return null;
    }

    return agent.status;
  }

  /** `true` se o Agent de `agentId` estiver com status WORKING. */
  isWorking(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.WORKING;
  }

  /** `true` se o Agent de `agentId` estiver com status IDLE. */
  isIdle(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.IDLE;
  }

  /** `true` se o Agent de `agentId` estiver com status OFFLINE. */
  isOffline(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.OFFLINE;
  }

  /** `true` se o Agent de `agentId` estiver com status WAITING. */
  isWaiting(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.WAITING;
  }

  /** `true` se o Agent de `agentId` estiver com status PAUSED. */
  isPaused(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.PAUSED;
  }

  /** `true` se o Agent de `agentId` estiver com status ERROR. */
  isError(agentId: string): boolean {
    return this.getStatus(agentId) === AgentStatus.ERROR;
  }
}
