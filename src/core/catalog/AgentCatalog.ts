import { agentStore } from "@/core/store/AgentStore";
import { AgentStatus } from "@/core/agents/registry/AgentStatus";
import { ExecutionPriority } from "./ExecutionPriority";
import type { AgentProfile } from "./AgentProfile";
import { AgentProfileStatus } from "./AgentProfileStatus";
import { agentCapabilityRegistry } from "./AgentCapabilityRegistry";
import { AgentHealthMonitor } from "./AgentHealthMonitor";
import { agentCatalogMetrics, type AgentCatalogMetricsSnapshot } from "./AgentCatalogMetrics";
import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";

/** Campos aceitos por `AgentCatalog.register()` quando o chamador cria um AgentProfile novo. */
export type AgentProfileInput = Pick<
  AgentProfile,
  "id" | "name" | "description" | "status" | "capabilities" | "supportedTaskTypes" | "priority" | "metadata"
>;

/** `true` se `status` for compatível com receber uma nova seleção agora — mesmo critério já usado por AgentSelector antes desta Sprint. */
function isAgentStatusAvailable(status: AgentStatus): boolean {
  return status !== AgentStatus.WORKING && status !== AgentStatus.ERROR;
}

/**
 * Fachada pública única do catálogo de Agents (Tarefa 01).
 *
 * ```
 * Application
 *    ↓
 * AgentCatalog.register/get/list/search/remove   ← único ponto de entrada
 *    ↓
 * AgentCapabilityRegistry   ← capacidades declarativas (skills/taskTypes)
 *    ↓
 * AgentProfile              ← metadados padronizados
 *    ↓
 * AgentSelector (@/core/orchestrator, atualizado)
 *    ↓
 * AgentOrchestrator (inalterado)
 * ```
 *
 * Responsabilidade: única fonte de verdade sobre "quais Agents existem
 * e o que sabem fazer" — `AgentSelector` (Tarefa 06) consulta
 * exclusivamente este catálogo e `AgentCapabilityRegistry`, nunca mais
 * `agentStore`/`AgentRegistry` diretamente.
 *
 * Seed inicial (construtor, Tarefa 09 — "sem inicializações
 * paralelas"): deriva o AgentProfile de `"blog-agent"` a partir do
 * `Agent` **já registrado** em `agentStore.getAgents()` (mecanismo
 * público já existente desde a Sprint 0A — `registerAgents()` já o
 * registrou na construção de `AgentStore`) — nunca cria um segundo
 * Agent, nunca duplica o registro original, apenas o descreve com os
 * campos novos desta Sprint (capacidades, prioridade, metadata).
 *
 * Dependências: `agentStore`/`AgentStatus` (públicos, inalterados),
 * `ExecutionPriority` (público, `@/core/orchestrator`, inalterado),
 * AgentCapabilityRegistry, AgentHealthMonitor, EventBus/EventTypes.
 */
export class AgentCatalog {
  private profiles = new Map<string, AgentProfile>();

  private readonly health = new AgentHealthMonitor();

  constructor() {
    this.seed();
  }

  private seed(): void {
    const existingAgents = agentStore.getAgents();

    for (const agent of existingAgents) {
      if (agent.id !== "blog-agent") {
        continue;
      }

      this.register({
        id: agent.id,
        name: agent.name,
        description: `${agent.department} — ${agent.workspace}`,
        status: AgentProfileStatus.ACTIVE,
        capabilities: ["writing", "markdown", "seo-copywriting"],
        supportedTaskTypes: ["blog"],
        priority: ExecutionPriority.NORMAL,
        metadata: {
          owner: "platform",
          tags: ["content", "blog"],
          category: "content-production",
          language: "pt-BR",
          costProfile: "low",
          latencyProfile: "moderate",
        },
      });

      agentCapabilityRegistry.register({
        agentId: agent.id,
        skills: ["writing", "markdown", "seo-copywriting"],
        taskTypes: ["blog"],
        limitations: ["no-real-time-data"],
        priority: ExecutionPriority.NORMAL,
      });
    }
  }

  /** Registra (ou substitui) um AgentProfile — `version` sempre inicia em 1. Emite AGENT_REGISTERED. */
  register(input: AgentProfileInput): AgentProfile {
    const now = new Date();

    const profile: AgentProfile = {
      id: input.id,
      name: input.name,
      description: input.description,
      version: 1,
      status: input.status,
      capabilities: input.capabilities,
      supportedTaskTypes: input.supportedTaskTypes,
      priority: input.priority,
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.profiles.set(profile.id, profile);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.AGENT_REGISTERED,
      source: "AgentCatalog",
      payload: { agentId: profile.id, name: profile.name },
      createdAt: now,
    });

    return profile;
  }

  /** Localiza o AgentProfile de `id`, ou `undefined` se não estiver registrado. */
  get(id: string): AgentProfile | undefined {
    return this.profiles.get(id);
  }

  /** Retorna todos os AgentProfile já registrados. */
  list(): AgentProfile[] {
    return Array.from(this.profiles.values());
  }

  /** Pesquisa por nome, descrição, capacidade, ou tag (texto livre, case-insensitive). */
  search(query: string): AgentProfile[] {
    const normalized = query.trim().toLowerCase();

    if (normalized.length === 0) {
      return [];
    }

    return this.list().filter(
      (profile) =>
        profile.name.toLowerCase().includes(normalized) ||
        profile.description.toLowerCase().includes(normalized) ||
        profile.capabilities.some((capability) => capability.toLowerCase().includes(normalized)) ||
        profile.metadata.tags.some((tag) => tag.toLowerCase().includes(normalized))
    );
  }

  /**
   * Atualiza os campos de `input` (parcial) no AgentProfile de `id`,
   * incrementando `version` e `updatedAt`. Emite AGENT_UPDATED. Retorna
   * `undefined` se o perfil não existir.
   */
  update(id: string, input: Partial<AgentProfileInput>): AgentProfile | undefined {
    const existing = this.profiles.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: AgentProfile = {
      ...existing,
      ...input,
      version: existing.version + 1,
      updatedAt: new Date(),
    };

    this.profiles.set(id, updated);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.AGENT_UPDATED,
      source: "AgentCatalog",
      payload: { agentId: id, version: updated.version },
      createdAt: updated.updatedAt,
    });

    return updated;
  }

  /** Remove o AgentProfile de `id`. Emite AGENT_REMOVED. Retorna `false` se não existir. */
  remove(id: string): boolean {
    const removed = this.profiles.delete(id);

    if (removed) {
      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.AGENT_REMOVED,
        source: "AgentCatalog",
        payload: { agentId: id },
        createdAt: new Date(),
      });
    }

    return removed;
  }

  /**
   * `true` se `agentId` puder receber uma nova seleção agora — combina
   * `AgentProfileStatus.ACTIVE`, disponibilidade manual já registrada em
   * AgentHealthMonitor (padrão: disponível), e o `AgentStatus` em tempo
   * real já mantido por `agentStore` (nunca `WORKING`/`ERROR`).
   */
  isAvailable(agentId: string): boolean {
    const profile = this.profiles.get(agentId);

    if (!profile || profile.status !== AgentProfileStatus.ACTIVE) {
      return false;
    }

    if (this.health.getHealth(agentId)?.available === false) {
      return false;
    }

    const agent = agentStore.getAgent(agentId);

    return Boolean(agent) && isAgentStatusAvailable(agent!.status);
  }

  /** Retorna a AgentHealth de `agentId`, ou `undefined` se nenhuma execução foi observada ainda (Tarefa 05). */
  getHealth(agentId: string) {
    return this.health.getHealth(agentId);
  }

  /** Métricas agregadas do catálogo (Tarefa 08). */
  getMetrics(): AgentCatalogMetricsSnapshot {
    return agentCatalogMetrics.snapshot(this.list(), agentCapabilityRegistry.list(), (id) => this.isAvailable(id));
  }
}

/** Instância única e compartilhada do AgentCatalog para toda a plataforma. */
export const agentCatalog = new AgentCatalog();
