/**
 * Queued Execution Step — o registro declarativo de que um Execution Step foi organizado em fila
 * pelo Queue Manager, absorvendo pico de demanda sem bloquear a publicação de novos Eventos
 * (`AUTOMATION_ENGINE.md`, Capítulo 7). Este artefato registra que o enfileiramento ocorreu, nunca
 * implementa o mecanismo de fila em si — nenhuma tecnologia concreta de mensageria é definida.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface QueuedExecutionStep {
  /** Identificador da entrada na fila. */
  readonly queueEntryId: string;

  /** Execution Step enfileirado — ver ExecutionStep.ts. */
  readonly executionStepId: string;

  /** Momento do enfileiramento. */
  readonly enqueuedAt: Date;

  /** Momento em que o processamento desta entrada foi concluído, quando aplicável. */
  readonly processedAt?: Date;
}
