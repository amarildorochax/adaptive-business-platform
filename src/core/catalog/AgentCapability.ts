import type { ExecutionPriority } from "./ExecutionPriority";

/**
 * Declaração do que um Agent sabe fazer (Tarefa 05 da Sprint Agent
 * Orchestrator) — consumida por `AgentCapabilityRegistry` (mesmo
 * submódulo) e por `AgentSelector` (`@/core/orchestrator`).
 *
 * Nota (Etapa 24A — Correção 01): movido de `@/core/orchestrator/
 * AgentCapability.ts` para cá, junto com `ExecutionPriority`, para
 * eliminar a dependência circular `catalog ↔ orchestrator` identificada
 * na Architecture Review (Etapa 24) — `catalog` importava este tipo de
 * `orchestrator`, enquanto `orchestrator/AgentSelector.ts` importava
 * `agentCatalog`/`agentCapabilityRegistry` de `catalog`. Com a mudança,
 * a dependência passa a fluir em um único sentido: `orchestrator` →
 * `catalog` (nunca o inverso). `@/core/orchestrator` continua exportando
 * `AgentCapability` (reexportado de `@/core/catalog/AgentCapability`)
 * para que nenhuma API pública existente mude — ver `orchestrator/
 * index.ts`. Nenhum campo, nenhum comportamento foi alterado.
 */
export interface AgentCapability {
  agentId: string;

  /** Habilidades declaradas (ex.: "writing", "markdown"). */
  skills: string[];

  /** Tipos de tarefa que este Agent pode assumir — usado por AgentSelector.select(taskType). */
  taskTypes: string[];

  /** Limitações conhecidas (ex.: "no-real-time-data") — apenas descritivo nesta Sprint. */
  limitations: string[];

  priority: ExecutionPriority;
}
