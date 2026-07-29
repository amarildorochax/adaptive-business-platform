import type { ExecutionPriority } from "./ExecutionPriority";
import type { AgentProfileStatus } from "./AgentProfileStatus";
import type { AgentMetadata } from "./AgentMetadata";

/**
 * Entrada padronizada de um Agent no catálogo — identidade, capacidades
 * declaradas, e metadados (Tarefa 02).
 *
 * `capabilities`/`supportedTaskTypes` aqui são a **visão pública e
 * resumida** (nomes/strings) do que já está registrado, em maior
 * detalhe, em `AgentCapabilityRegistry` (ver AgentCapabilityRegistry.ts)
 * — a fonte de verdade para seleção real permanece
 * `AgentCapabilityRegistry`, nunca estes dois campos por si só.
 *
 * `priority` reaproveita `ExecutionPriority` (mesmo submódulo desde a
 * Etapa 24A — Correção 01; antes publicado em `@/core/orchestrator`,
 * reexportado de lá para preservar compatibilidade) — mesma escala já
 * usada por `AgentCapability.priority`, evitando uma segunda enumeração
 * de prioridade.
 *
 * `id` corresponde sempre ao `Agent.id` já existente em AgentRegistry
 * (`@/core/agents/registry/Agent.ts`, inalterado) — um AgentProfile
 * nunca existe para um `id` que não esteja também registrado ali.
 */
export interface AgentProfile {
  id: string;

  name: string;

  description: string;

  version: number;

  status: AgentProfileStatus;

  capabilities: string[];

  supportedTaskTypes: string[];

  priority: ExecutionPriority;

  metadata: AgentMetadata;

  createdAt: Date;

  updatedAt: Date;
}
