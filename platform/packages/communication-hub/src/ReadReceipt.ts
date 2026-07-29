/**
 * Read Receipt — confirmação de que uma Message foi efetivamente lida pelo destinatário, registrada
 * apenas quando o Canal de origem efetivamente suporta e reporta esse sinal, e imutável uma vez
 * registrada (Blueprint, Capítulo 12).
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface ReadReceipt {
  /** Identificador do Read Receipt. */
  readonly readReceiptId: string;

  /** Message confirmada como lida. */
  readonly messageId: string;

  /** Momento da leitura confirmada. */
  readonly readAt: Date;
}
