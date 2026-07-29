/**
 * Trigger — o evento, tempo, ação manual ou sinal externo que inicia a avaliação de um Workflow.
 * Oito categorias já catalogadas em `AUTOMATION_ENGINE.md`, Capítulo 9 — "Mudança de dados" é
 * tecnicamente implementada como um Evento publicado pelo Hub de origem no momento da mudança, mas
 * mantida como categoria própria na fonte, conforme já registrado naquele capítulo, e reproduzida
 * aqui sem alteração.
 * `sourceDescription` é sempre uma descrição opaca — para a categoria "Event" ou "DataChange", o tipo
 * de Evento de origem (ex.: "OpportunityWon") nunca é importado de `@abp/crm-hub`,
 * `@abp/communication-hub`, `@abp/finance-hub`, `@abp/analytics-hub`, ou `@abp/growth-hub`; para a
 * categoria "AI", o resultado do AI Hub nunca é importado de `@abp/ai`.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 9.
 */
export type TriggerCategory =
  | "Time"
  | "Event"
  | "Manual"
  | "Webhook"
  | "API"
  | "DataChange"
  | "AI"
  | "Integration";

export interface Trigger {
  /** Identificador do Trigger. */
  readonly triggerId: string;

  /** Tenant ao qual o Trigger pertence. */
  readonly tenantId: string;

  /** Categoria do Trigger. */
  readonly category: TriggerCategory;

  /** Descrição opaca da origem específica (ex.: nome do Evento, descrição do Webhook) — nunca um tipo importado de outro pacote. */
  readonly sourceDescription: string;

  /** Momento do registro. */
  readonly registeredAt: Date;
}
