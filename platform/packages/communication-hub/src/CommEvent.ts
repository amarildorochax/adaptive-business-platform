/**
 * Communication Event — os quinze Eventos de domínio publicados pelo Communication Hub, cada um um
 * Fato consumado, publicados exclusivamente pelo Event Publisher, com ordenação garantida por
 * Conversation.
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 10, e confirmada em
 * `COMMUNICATION_HUB.md`, Capítulo 12 ("o catálogo completo dos quinze Eventos").
 * Nota de reconciliação: a Introdução de `COMMUNICATION_HUB.md` (Capítulo 1) cita "dezoito Eventos",
 * inconsistente com a contagem de quinze já usada por seu próprio Capítulo 12 e com o catálogo
 * efetivamente listado em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 10 — quinze é o valor usado
 * aqui, por ser o único apoiado por enumeração explícita em ambos os documentos.
 */
export type CommEventType =
  | "ConversationStarted"
  | "ConversationAssigned"
  | "MessageReceived"
  | "MessageSent"
  | "MessageDelivered"
  | "MessageFailed"
  | "MessageRead"
  | "NotificationSent"
  | "BroadcastStarted"
  | "BroadcastFinished"
  | "AttachmentUploaded"
  | "ConversationClosed"
  | "TemplateUpdated"
  | "DeliveryRetried"
  | "WebhookReceived";

export interface CommEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: CommEventType;

  /** Conversation à qual este Evento se refere, quando aplicável. */
  readonly conversationId?: string;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
