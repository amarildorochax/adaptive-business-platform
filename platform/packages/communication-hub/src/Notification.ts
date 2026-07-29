/**
 * Notification — comunicação unidirecional, tipicamente originada da própria plataforma para um
 * Usuário ou para uma parte externa, sem expectativa de resposta conversacional, distinta de Message.
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Notification {
  /** Identificador da Notification. */
  readonly notificationId: string;

  /** Tenant ao qual esta Notification pertence. */
  readonly tenantId: string;

  /** Destinatário — identificador opaco. */
  readonly recipientId: string;

  /** Canal usado para o envio. */
  readonly channelId: string;

  /** Momento do despacho. */
  readonly sentAt: Date;
}
