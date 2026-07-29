/**
 * Notification Request — a entrega de notificação a um Usuário administrada pelo Notification
 * Engine, tanto para solicitar aprovação quanto para informar resultado de execução, consumindo o
 * Communication Hub e o Branding Hub para garantir que a notificação respeite identidade e tom da
 * empresa (`AUTOMATION_ENGINE.md`, Capítulo 7).
 * `recipientDescription` é sempre opaca — nenhum tipo de `@abp/communication-hub` é importado; a
 * entrega técnica real permanece responsabilidade exclusiva daquele Hub.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export type NotificationPurpose = "ApprovalRequest" | "ExecutionResult";

export interface NotificationRequest {
  /** Identificador da Notification Request. */
  readonly notificationRequestId: string;

  /** Finalidade da notificação. */
  readonly purpose: NotificationPurpose;

  /** Descrição opaca do destinatário — nunca um tipo importado de outro pacote. */
  readonly recipientDescription: string;

  /** Approval Checkpoint ou Execution ao qual esta notificação se refere — identificador opaco. */
  readonly relatedId: string;

  /** Momento do envio. */
  readonly sentAt: Date;
}
