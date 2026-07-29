import type { AgentProfile } from "./AgentProfile";

/**
 * Contrato de versionamento de Agent futuro (Tarefa 10 — não
 * implementado nesta Sprint). `AgentCatalog` hoje apenas incrementa
 * `AgentProfile.version` a cada `update()` — nenhum histórico é
 * mantido. Mesmo princípio já reservado por `MemorySnapshot`/
 * `PromptSnapshot` (`@/core/memory`, `@/core/prompt`, ambos inalterados
 * nesta Sprint).
 *
 * Responsabilidade reservada: retrato completo de um AgentProfile em
 * uma versão específica. Nenhum componente desta Sprint cria, armazena,
 * ou consulta um AgentProfileSnapshot.
 */
export interface AgentProfileSnapshot {
  agentId: string;
  version: number;
  profile: AgentProfile;
  snapshotAt: Date;
}
