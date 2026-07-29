/**
 * Queued Message — registro de mensagem técnica absorvida por uma Fila, garantindo processamento
 * ordenado sem perda mesmo sob pico de tráfego.
 * Estrutura definida em INTEGRATION_RESILIENCE_CONCRETE_STRUCTURE.md.
 */
export interface QueuedMessage {
  /** Nome da Fila que absorveu esta mensagem. */
  readonly queueName: string;

  /** Identificador da mensagem. */
  readonly messageId: string;

  /** Momento em que a mensagem foi absorvida pela Fila. */
  readonly receivedAt: Date;
}
