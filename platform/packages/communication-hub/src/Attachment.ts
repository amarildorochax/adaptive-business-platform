/**
 * Attachment — arquivo anexado a uma Message, com seu próprio metadado de tipo e tamanho; nunca
 * existe sem uma Message associada (Blueprint, Capítulo 12).
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Attachment {
  /** Identificador do Attachment. */
  readonly attachmentId: string;

  /** Message à qual este Attachment está associado — nunca existe isoladamente. */
  readonly messageId: string;

  /** Tipo do arquivo. */
  readonly fileType: string;

  /** Tamanho do arquivo, em bytes. */
  readonly fileSize: number;
}
