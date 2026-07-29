/**
 * Thread — agrupamento de Message dentro de uma Conversation, relevante quando um Canal suporta
 * múltiplos fios de discussão simultâneos sobre o mesmo relacionamento.
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Thread {
  /** Identificador do Thread. */
  readonly threadId: string;

  /** Conversation à qual este Thread pertence. */
  readonly conversationId: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
