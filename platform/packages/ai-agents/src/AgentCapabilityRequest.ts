/**
 * Agent Capability Request — o ponto de entrada único de toda solicitação de capacidade apoiada por
 * Agente, recebido pelo Agent Capability Manager (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seções 4 e
 * 5). Representa exclusivamente que uma solicitação foi feita — nunca decide, planeja, ou raciocina
 * sobre ela.
 * `requesterKind` identifica apenas a categoria do domínio solicitante, nunca um tipo importado
 * daquele domínio: para `"Runtime"`, nenhum tipo de `@abp/runtime` além deste identificador; para
 * `"AutomationEngine"`, nenhum tipo de `@abp/automation-engine`; para `"BusinessHub"`, nenhum tipo de
 * `@abp/crm-hub`, `@abp/communication-hub`, `@abp/finance-hub`, `@abp/analytics-hub`, ou
 * `@abp/growth-hub`.
 * `purposeDescription` é sempre opaco — a finalidade da solicitação nunca é interpretada,
 * decomposta, ou planejada por este pacote; essa capacidade permanece exclusiva do AI Core
 * (Reasoning, Component 19; Planning, Component 20), consumido apenas por seu contrato externo.
 * Estrutura definida em `AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seção 5.
 */
export type DelegationRequesterKind = "Runtime" | "AutomationEngine" | "BusinessHub";

export interface AgentCapabilityRequest {
  /** Identificador da Agent Capability Request. */
  readonly agentCapabilityRequestId: string;

  /** Categoria do domínio solicitante — nunca um tipo importado daquele domínio. */
  readonly requesterKind: DelegationRequesterKind;

  /** Descrição opaca da finalidade da solicitação — nunca interpretada por este pacote. */
  readonly purposeDescription: string;

  /** Momento em que a solicitação foi recebida. */
  readonly requestedAt: Date;
}
