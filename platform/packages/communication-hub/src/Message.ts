/**
 * Message — unidade individual de comunicação, sempre associada a exatamente uma Conversation,
 * imutável após criação — apenas o Delivery Status associado evolui (Message Immutability).
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Message {
  /** Identificador da Message. */
  readonly messageId: string;

  /** Tenant ao qual a Message pertence. */
  readonly tenantId: string;

  /** Conversation à qual esta Message pertence — nenhuma Message existe sem Conversation. */
  readonly conversationId: string;

  /** Thread ao qual esta Message pertence, quando o Canal suporta múltiplos fios simultâneos. */
  readonly threadId?: string;

  /** Canal de origem desta Message. */
  readonly channelId: string;

  /** Remetente — identificador opaco de Usuário da Empresa ou de parte externa. */
  readonly senderId: string;

  /** Conteúdo da Message, imutável após criação. */
  readonly content: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
