/**
 * Broadcast — envio coordenado de uma mesma Message a múltiplos destinatários, sempre decomposto em
 * Delivery individuais rastreáveis — nenhum Broadcast é tratado como operação atômica opaca
 * (Blueprint, Capítulo 12 e ADR-009).
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Broadcast {
  /** Identificador do Broadcast. */
  readonly broadcastId: string;

  /** Tenant ao qual este Broadcast pertence. */
  readonly tenantId: string;

  /** Message enviada a todos os destinatários. */
  readonly messageId: string;

  /** Destinatários — cada um produz sua própria Delivery rastreável. */
  readonly recipientIds: readonly string[];

  /** Momento de início. */
  readonly startedAt: Date;

  /** Momento em que todo envio individual já foi processado. */
  readonly finishedAt?: Date;
}
