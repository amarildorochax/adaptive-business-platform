/**
 * Communication Business Rule — o catálogo declarativo das doze Regras de negócio do domínio de
 * comunicação, verificadas antes de qualquer mudança de estado relevante. Este artefato registra o
 * catálogo, nunca a lógica de verificação.
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 12.
 *
 * Nota de reconciliação: `COMMUNICATION_HUB.md`, Capítulo 1, afirma "dez Regras de negócio", mas
 * `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 12, enumera doze parágrafos de Regra distintos, sem
 * nenhum par claramente redundante entre si. Doze é o valor usado aqui, por ser o diretamente
 * enumerado na fonte proprietária do domínio (o Blueprint), mesmo critério já aplicado à contagem de
 * Eventos em `CommEvent.ts`.
 */
export type CommBusinessRuleId =
  | "MessageBelongsToConversation"
  | "ConversationSpansMultipleChannels"
  | "DeliveryNeverAltersMessage"
  | "TemplateIsVersioned"
  | "RetryNeverAltersHistory"
  | "ReceiptsAreImmutable"
  | "WebhookNeverAltersMessagesDirectly"
  | "ConversationHasExactlyOneStatus"
  | "BroadcastDecomposedIntoIndividualDeliveries"
  | "MessageRequiresPolicyCheck"
  | "AttachmentRequiresMessage"
  | "ReadReceiptRequiresChannelSupport";

export interface CommBusinessRule {
  /** Identificador da Regra. */
  readonly ruleId: CommBusinessRuleId;

  /** Descrição da Regra, conforme já fixada em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 12. */
  readonly description: string;
}
