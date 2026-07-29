/**
 * Conversation Assignment — a atribuição de um responsável humano por uma Conversation em um dado
 * momento, podendo ser transferida ao longo do tempo; toda Conversation possui, em um dado momento,
 * exatamente um Conversation Assignment válido, nunca dois atendentes simultaneamente responsáveis.
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface ConversationAssignment {
  /** Conversation à qual esta atribuição se refere. */
  readonly conversationId: string;

  /** Identificador opaco do responsável atribuído. */
  readonly assigneeId: string;

  /** Momento da atribuição. */
  readonly assignedAt: Date;
}
