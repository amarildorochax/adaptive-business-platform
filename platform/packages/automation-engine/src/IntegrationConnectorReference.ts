/**
 * Integration Connector Reference — o registro de que uma Action de categoria "TriggerIntegration"
 * alcançou um sistema externo exclusivamente através do Integration Hub — o Automation Engine nunca
 * implementa sua própria integração direta com um sistema externo (ADR-010, `AUTOMATION_ENGINE.md`,
 * Capítulo 7).
 * `connectionReferenceId` é sempre opaco — nenhum tipo de `@abp/platform-services` é importado.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface IntegrationConnectorReference {
  /** Identificador do registro de invocação. */
  readonly integrationConnectorReferenceId: string;

  /** Action de categoria "TriggerIntegration" à qual esta invocação se refere — ver Action.ts (Sprint 6.3). */
  readonly actionId: string;

  /** Referência opaca à Connection já mantida pelo Integration Hub — nunca um tipo importado. */
  readonly connectionReferenceId: string;

  /** Momento da invocação. */
  readonly invokedAt: Date;
}
