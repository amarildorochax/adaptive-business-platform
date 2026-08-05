/**
 * Register Webhook Payload — conteúdo do Command "RegisterWebhook" (`COMMAND_CATALOG.md`: "processar
 * notificação técnica recebida de sistema externo... Pré-condições: Webhook validado quanto à origem
 * e à assinatura"), consumível pelo contrato genérico Command<TPayload> já implementado em @abp/core.
 *
 * Apesar do nome do Command, esta operação nunca cria um `WebhookRegistration` (o registro do
 * endpoint de recebimento, responsabilidade do Webhook Manager, sem Command próprio catalogado) —
 * ela processa uma notificação já recebida em um endpoint já registrado, produzindo um
 * `WebhookDelivery`. Ver "Decisões Arquiteturais" em `INTEGRATION_HUB_CORE_MIGRATION_REPORT.md`.
 *
 * A verificação de origem/assinatura em si (`WebhookValidation`, `platform/packages/infrastructure/`,
 * Component 11) nunca é reimplementada aqui — `INTEGRATION_CONCRETE_STRUCTURE.md` proíbe explicitamente
 * qualquer dependência de `@abp/infrastructure`; esta Sprint assume que a validação, quando
 * implementada, já aconteceu antes desta chamada, mesma disciplina de "tecnologia concreta fora de
 * escopo" já aplicada a `DispatcherService.dispatch(succeeded)` (Runtime, IMP-013).
 */
export interface RegisterWebhookPayload {
  /** Connector que recebeu a notificação. */
  readonly connectorId: string;

  /** Tenant ao qual a notificação pertence. */
  readonly tenantId: string;
}
