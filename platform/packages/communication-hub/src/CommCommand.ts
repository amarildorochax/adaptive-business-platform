/**
 * Communication Command — os treze Comandos que mudam estado dentro do Communication Hub, cada um
 * seguindo Idempotent Delivery quando aplicável a operação de envio.
 * Estrutura definida em `COMMUNICATION_HUB.md`, Capítulo 10.
 */
export type CommCommandType =
  | "StartConversation"
  | "AssignConversation"
  | "TransferConversation"
  | "CloseConversation"
  | "UpdateConversationStatus"
  | "SendMessage"
  | "UploadAttachment"
  | "RetryDelivery"
  | "CreateTemplate"
  | "UpdateTemplate"
  | "SendBroadcast"
  | "RegisterWebhook"
  | "ChangeCommunicationPreference";

export interface CommCommand {
  /** Identificador de operação, único por execução — garante Idempotência. */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: CommCommandType;

  /** Momento em que o Comando foi recebido pelo Communication Manager. */
  readonly requestedAt: Date;
}
