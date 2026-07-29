import type { Agent } from "../agents/registry/Agent";
import { AgentStatus } from "../agents/registry/AgentStatus";
import { AgentRegistry } from "../agents/registry/AgentRegistry";
import { registerAgents } from "../agents/registry/registerAgents";
import { AgentStatusManager } from "../agents/status/AgentStatusManager";

type Listener = () => void;

/**
 * Fachada de acesso aos Agent da plataforma, consumida diretamente pela
 * UI (ex.: `src/components/cards/KpiCards.tsx`).
 *
 * Responsabilidade: expor leitura de Agent/status já resolvidos por
 * AgentRegistry/AgentStatusManager, e notificar assinantes (`subscribe`)
 * sempre que um status muda — é o que permite a UI React re-renderizar
 * sem consultar o registry diretamente.
 *
 * Objetivo: ser o único ponto de entrada de Agent para consumidores de
 * fora de `src/core/agents/*` — nenhum componente de UI deve importar
 * AgentRegistry diretamente.
 *
 * Dependências: AgentRegistry, AgentStatusManager, registerAgents (todos
 * em src/core/agents/*). Nenhuma dependência de TaskQueue ou de EventBus.
 *
 * Exemplo de uso:
 * ```ts
 * const unsubscribe = agentStore.subscribe(() => {
 *   console.log(agentStore.totalAgents());
 * });
 *
 * agentStore.updateStatus("blog-agent", AgentStatus.WORKING);
 * ```
 */
export class AgentStore {
  private registry = new AgentRegistry();

  private statusManager: AgentStatusManager;

  private listeners = new Set<Listener>();

  constructor() {
    registerAgents(this.registry);

    this.statusManager = new AgentStatusManager(this.registry);
  }

  /**
   * Registra um listener chamado sempre que `updateStatus()` alterar
   * com sucesso o status de algum Agent.
   *
   * @returns função de cancelamento da assinatura.
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /** Retorna todos os Agent já registrados. */
  getAgents(): Agent[] {
    return this.registry.getAll();
  }

  /** Retorna o Agent de `id`, ou `undefined` se não estiver registrado. */
  getAgent(id: string): Agent | undefined {
    return this.registry.get(id);
  }

  /** Quantidade total de Agent registrados. */
  totalAgents(): number {
    return this.registry.count();
  }

  /**
   * Atualiza o status do Agent de `id` e notifica todos os listeners já
   * assinados, se a atualização tiver sucesso.
   *
   * @returns `false` sem notificar se o Agent não estiver registrado.
   */
  updateStatus(id: string, status: AgentStatus): boolean {
    const updated = this.statusManager.setStatus(id, status);

    if (updated) {
      this.notify();
    }

    return updated;
  }

  /** Retorna o status atual do Agent de `id`, ou `null` se não estiver registrado. */
  getStatus(id: string): AgentStatus | null {
    return this.statusManager.getStatus(id);
  }
}

/** Instância única e compartilhada do AgentStore para toda a plataforma. */
export const agentStore = new AgentStore();
