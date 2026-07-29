import type { Agent } from "./Agent";

/**
 * Registro central de Agent em memória, indexado por `id`.
 *
 * Responsabilidade: manter o cadastro de Agent conhecidos pela
 * plataforma e permitir sua consulta/atualização de status.
 *
 * Objetivo: ser a única fonte de verdade sobre quais Agent existem —
 * AgentStore (src/core/store/AgentStore.ts) é a fachada consumida pela
 * UI; AgentRegistry é a estrutura de dados que ela envolve.
 *
 * Dependências: apenas o tipo `Agent` (Agent.ts). Nenhuma dependência de
 * EventBus, TaskQueue, ou qualquer outro submódulo de Core.
 *
 * Exemplo de uso:
 * ```ts
 * const registry = new AgentRegistry();
 * registry.register(BlogAgent);
 * registry.updateStatus("blog-agent", AgentStatus.WORKING);
 * ```
 */
export class AgentRegistry {
  private agents = new Map<string, Agent>();

  /** Registra (ou substitui, se já existir o mesmo `id`) um Agent. */
  register(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  /** Remove o Agent de `id` do registro, se existir. */
  unregister(id: string): void {
    this.agents.delete(id);
  }

  /** Retorna o Agent de `id`, ou `undefined` se não estiver registrado. */
  get(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  /** Retorna todos os Agent já registrados. */
  getAll(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Atualiza o status do Agent de `id` e sua `updatedAt`. Não faz nada
   * (nem lança erro) se o Agent não estiver registrado.
   */
  updateStatus(id: string, status: Agent["status"]): void {
    const agent = this.agents.get(id);

    if (!agent) return;

    agent.status = status;
    agent.updatedAt = new Date();
  }

  /** Remove todos os Agent do registro. */
  clear(): void {
    this.agents.clear();
  }

  /** Quantidade total de Agent registrados. */
  count(): number {
    return this.agents.size;
  }
}
