/** Perfil de custo aproximado de invocar este Agent — apenas descritivo, nenhuma lógica de custo real nesta Sprint. */
export type AgentCostProfile = "low" | "medium" | "high";

/** Perfil de latência aproximada deste Agent — apenas descritivo; distinto de AgentHealth.averageDurationMs, que é medido de verdade. */
export type AgentLatencyProfile = "fast" | "moderate" | "slow";

/**
 * Metadados descritivos de um Agent, além de suas capacidades (Tarefa
 * 04) — usados para organização/filtragem no catálogo, nunca para
 * seleção determinística (isso permanece exclusivo de
 * AgentCapability.taskTypes, via AgentSelector).
 */
export interface AgentMetadata {
  owner: string;

  tags: string[];

  category: string;

  language: string;

  costProfile: AgentCostProfile;

  latencyProfile: AgentLatencyProfile;
}
