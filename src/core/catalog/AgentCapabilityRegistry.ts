import type { AgentCapability } from "./AgentCapability";

/**
 * Registro central de AgentCapability, indexado por `agentId` (Tarefa
 * 03) — a fonte de verdade para "o que cada Agent sabe fazer",
 * substituindo o `Map` interno que antes vivia dentro de
 * `AgentSelector` (`@/core/orchestrator/AgentSelector.ts`, atualizado
 * por esta Sprint — Tarefa 06 — para consumir exclusivamente este
 * registro em vez de manter seu próprio).
 *
 * Nota (Etapa 24A — Correção 01): `AgentCapability` foi movido para
 * este mesmo submódulo (`./AgentCapability.ts`), antes publicado em
 * `@/core/orchestrator` — eliminou a dependência circular
 * `catalog ↔ orchestrator`. `@/core/orchestrator` continua reexportando
 * `AgentCapability` (agora vindo daqui) para preservar 100% da API
 * pública já existente. Nenhum formato paralelo foi criado, nenhum
 * comportamento mudou — apenas a localização física do tipo.
 *
 * Dependências: AgentCapability (tipo, mesmo submódulo).
 *
 * Instância única e compartilhada (`agentCapabilityRegistry`) — tanto
 * `AgentCatalog` quanto `AgentSelector` operam sobre os mesmos dados,
 * nunca cópias independentes.
 */
export class AgentCapabilityRegistry {
  private capabilities = new Map<string, AgentCapability>();

  /** Registra (ou substitui) a capacidade declarada de um Agent. */
  register(capability: AgentCapability): void {
    this.capabilities.set(capability.agentId, capability);
  }

  /** Remove a capacidade declarada de `agentId`. Retorna `false` se não existir. */
  unregister(agentId: string): boolean {
    return this.capabilities.delete(agentId);
  }

  /** Retorna a capacidade declarada de `agentId`, ou `undefined` se nenhuma foi registrada. */
  get(agentId: string): AgentCapability | undefined {
    return this.capabilities.get(agentId);
  }

  /** Retorna todas as capacidades já registradas. */
  list(): AgentCapability[] {
    return Array.from(this.capabilities.values());
  }

  /** Retorna as capacidades que declaram a habilidade `skill` entre `skills`. */
  searchByCapability(skill: string): AgentCapability[] {
    return this.list().filter((capability) => capability.skills.includes(skill));
  }

  /** Retorna as capacidades que declaram `taskType` entre `taskTypes` — usado por AgentSelector.select(). */
  searchByTaskType(taskType: string): AgentCapability[] {
    return this.list().filter((capability) => capability.taskTypes.includes(taskType));
  }
}

/** Instância única e compartilhada do AgentCapabilityRegistry para toda a plataforma. */
export const agentCapabilityRegistry = new AgentCapabilityRegistry();
