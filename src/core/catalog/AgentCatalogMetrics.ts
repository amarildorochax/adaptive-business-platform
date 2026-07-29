import type { AgentProfile } from "./AgentProfile";
import type { AgentCapability } from "./AgentCapability";

/** Retrato agregado do catálogo, produzido sob demanda por `AgentCatalogMetrics.snapshot()`. */
export interface AgentCatalogMetricsSnapshot {
  registeredAgents: number;
  agentsByCategory: Record<string, number>;
  registeredCapabilities: number;
  selectionsPerformed: number;
  availableAgents: number;
}

/**
 * Métricas do catálogo de Agents (Tarefa 08) — mesmo padrão já usado
 * por AIMetrics/MemoryMetrics/PromptMetrics/OrchestratorMetrics/
 * WorkflowMetrics.
 *
 * Responsabilidade: registrar cada seleção realizada (`recordSelection`,
 * chamado por AgentSelector) e agregar, sob demanda, contagens de
 * Agents, capacidades, e disponibilidade — os dois últimos calculados a
 * partir de listas já fornecidas pelo chamador (`AgentCatalog`), para
 * que `AgentCatalogMetrics` não precise depender de `AgentCatalog`/
 * `AgentCapabilityRegistry` diretamente.
 *
 * Dependências: AgentProfile/AgentCapability (tipos, apenas para tipar
 * o snapshot).
 */
export class AgentCatalogMetrics {
  private selections = 0;

  /** Registra que uma seleção de Agent foi realizada (sucesso ou não). */
  recordSelection(): void {
    this.selections++;
  }

  /** Monta um retrato agregado — recebe as listas já resolvidas por AgentCatalog, para não duplicar o armazenamento delas aqui. */
  snapshot(profiles: AgentProfile[], capabilities: AgentCapability[], isAvailable: (agentId: string) => boolean): AgentCatalogMetricsSnapshot {
    const agentsByCategory: Record<string, number> = {};
    let availableAgents = 0;

    for (const profile of profiles) {
      agentsByCategory[profile.metadata.category] = (agentsByCategory[profile.metadata.category] ?? 0) + 1;

      if (isAvailable(profile.id)) {
        availableAgents++;
      }
    }

    return {
      registeredAgents: profiles.length,
      agentsByCategory,
      registeredCapabilities: capabilities.length,
      selectionsPerformed: this.selections,
      availableAgents,
    };
  }

  /** Descarta a contagem de seleções já registrada. */
  clear(): void {
    this.selections = 0;
  }
}

/** Instância única e compartilhada do AgentCatalogMetrics para toda a plataforma. */
export const agentCatalogMetrics = new AgentCatalogMetrics();
