/**
 * Dead Letter Entry — o registro de toda execução de Action que falhou de forma definitiva, após
 * esgotar a política de nova tentativa administrada pelo Retry Manager (Sprint 6.3) — preservando o
 * evento e o contexto da falha para investigação manual, em vez de descartá-lo silenciosamente ou
 * deixá-lo bloqueado indefinidamente em uma fila de execução ativa (`AUTOMATION_ENGINE.md`,
 * Capítulo 7, ADR-011).
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export interface DeadLetterEntry {
  /** Identificador da Dead Letter Entry. */
  readonly deadLetterEntryId: string;

  /** Execution Step que falhou de forma definitiva — ver ExecutionStep.ts (Sprint 6.3). */
  readonly executionStepId: string;

  /** Descrição do contexto da falha, preservado para investigação manual. */
  readonly failureDescription: string;

  /** Momento em que a falha definitiva foi registrada. */
  readonly receivedAt: Date;
}
