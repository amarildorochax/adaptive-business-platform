import { agentCatalog } from "@/core/catalog/AgentCatalog";
import { agentCapabilityRegistry } from "@/core/catalog/AgentCapabilityRegistry";
import { agentCatalogMetrics } from "@/core/catalog/AgentCatalogMetrics";
import type { AgentProfile } from "@/core/catalog/AgentProfile";
import type { AgentCapability } from "@/core/catalog/AgentCapability";
import { ExecutionPriority } from "@/core/catalog/ExecutionPriority";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";

/**
 * Seleciona qual Agent deve executar um determinado tipo de tarefa
 * (Tarefa 06 da Sprint Agent Orchestrator; **atualizado** pela Sprint
 * Agent Catalog, Tarefa 06 — exceção explícita e pontual à proibição
 * geral de alterar o Agent Orchestrator daquela Sprint, exigida
 * literalmente por seu próprio enunciado: "Atualizar AgentSelector...
 * Eliminar dependências de registros manuais de capacidades").
 *
 * Passou a consultar **exclusivamente** `AgentCatalog` e
 * `AgentCapabilityRegistry` (`@/core/catalog`) — o `Map` interno de
 * capacidades registradas manualmente (seedado no construtor) foi
 * eliminado; `agentStore`/`AgentStatus` não são mais importados aqui
 * diretamente — `AgentCatalog.isAvailable()` já encapsula essa
 * checagem internamente.
 *
 * Compatibilidade binária preservada (Tarefa 12, "compatibilidade
 * total"): `AgentOrchestrator.ts` (inalterado) ainda faz `new
 * AgentSelector()` (construtor sem argumentos, preservado) e ainda
 * expõe `registerAgentCapability()` repassando para
 * `this.selector.registerCapability(...)` (método público, mesma
 * assinatura, preservado — agora delega a
 * `agentCapabilityRegistry.register()` em vez do `Map` local).
 * `ExecutionPlanner.ts` (inalterado) ainda faz
 * `this.selector.select(taskType)?.id` — `select()` passou a retornar
 * `AgentProfile` em vez de `Agent`, mas ambos possuem `.id: string`,
 * então nenhuma mudança de tipo quebra aquele consumidor.
 *
 * Responsabilidade: única lógica de seleção de Agent da plataforma —
 * determinística, baseada em regra (correspondência de `taskType` +
 * `AgentProfileStatus.ACTIVE` + disponibilidade), **nunca IA**.
 *
 * Dependências: `agentCatalog`/`agentCapabilityRegistry`/
 * `agentCatalogMetrics` (`@/core/catalog`, públicos), `AgentCapability`/
 * `ExecutionPriority` (tipos, `@/core/catalog` desde a Etapa 24A —
 * Correção 01, que eliminou a dependência circular `catalog ↔
 * orchestrator` movendo esses dois tipos para lá).
 *
 * Consumido exclusivamente por ExecutionPlanner.
 */
export class AgentSelector {
  /** Registra (ou substitui) a capacidade declarada de um Agent — delega a AgentCapabilityRegistry (compatibilidade preservada para AgentOrchestrator.registerAgentCapability()). */
  registerCapability(capability: AgentCapability): void {
    agentCapabilityRegistry.register(capability);
  }

  /** Retorna a capacidade declarada de `agentId`, ou `undefined` se nenhuma foi registrada. */
  getCapability(agentId: string): AgentCapability | undefined {
    return agentCapabilityRegistry.get(agentId);
  }

  /**
   * Seleciona um AgentProfile capaz de assumir `taskType`, ativo no
   * AgentCatalog, e disponível agora (`AgentCatalog.isAvailable()`).
   * Entre múltiplos candidatos, prioriza `AgentCapability.priority`
   * (CRITICAL > HIGH > NORMAL > LOW); em empate, o primeiro encontrado.
   * Emite `AGENT_SELECTED` e registra a seleção em
   * `AgentCatalogMetrics` quando um candidato é encontrado.
   *
   * @returns o AgentProfile selecionado (sempre com `.id: string`,
   * compatível com o uso já existente em `ExecutionPlanner.ts`), ou
   * `undefined` se nenhum candidato declarado para `taskType` estiver
   * registrado e disponível.
   */
  select(taskType: string): AgentProfile | undefined {
    const priorityOrder: ExecutionPriority[] = [
      ExecutionPriority.CRITICAL,
      ExecutionPriority.HIGH,
      ExecutionPriority.NORMAL,
      ExecutionPriority.LOW,
    ];

    const candidates = agentCapabilityRegistry
      .searchByTaskType(taskType)
      .map((capability) => agentCatalog.get(capability.agentId))
      .filter((profile): profile is AgentProfile => profile !== undefined && agentCatalog.isAvailable(profile.id));

    if (candidates.length === 0) {
      return undefined;
    }

    const selected = candidates.sort((a, b) => {
      const priorityA = priorityOrder.indexOf(a.priority);
      const priorityB = priorityOrder.indexOf(b.priority);

      return priorityA - priorityB;
    })[0];

    agentCatalogMetrics.recordSelection();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.AGENT_SELECTED,
      source: "AgentSelector",
      payload: { agentId: selected.id, taskType },
      createdAt: new Date(),
    });

    return selected;
  }
}
