/**
 * Conversation — o agrupamento central de toda troca de comunicação com uma parte externa,
 * independentemente de quantos Canais participaram ao longo do tempo; o Aggregate raiz do domínio,
 * nunca a Message individual.
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type ConversationStatus = "Open" | "InProgress" | "Closed";

export interface Conversation {
  /** Identificador da Conversation. */
  readonly conversationId: string;

  /** Tenant ao qual a Conversation pertence. */
  readonly tenantId: string;

  /** Estado operacional — sempre exatamente um, nunca dois simultâneos (Blueprint, Capítulo 12). */
  readonly status: ConversationStatus;

  /** Momento de criação. */
  readonly createdAt: Date;
}
