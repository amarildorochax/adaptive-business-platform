/**
 * Communication Query — as doze Consultas de leitura do Communication Hub, cada uma resolvida contra
 * um Read Model já materializado.
 * Estrutura definida em `COMMUNICATION_HUB.md`, Capítulo 11.
 */
export type CommQueryType =
  | "ConversationView"
  | "ConversationTimeline"
  | "Inbox"
  | "Outbox"
  | "DeliveryStatus"
  | "BroadcastStatus"
  | "UnreadConversations"
  | "AssignedConversations"
  | "ConversationSearch"
  | "MessageHistory"
  | "DeliveryHistory"
  | "CommunicationDashboard";

export interface CommQuery {
  /** Identificador da Query. */
  readonly queryId: string;

  /** Tipo da Query. */
  readonly type: CommQueryType;

  /** Momento em que a Query foi solicitada. */
  readonly requestedAt: Date;
}
