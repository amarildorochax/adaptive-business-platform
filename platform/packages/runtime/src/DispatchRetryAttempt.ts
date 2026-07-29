/**
 * Dispatch Retry Attempt — a tentativa de nova entrega administrada pelo Runtime Retry Coordinator
 * quando o próprio Dispatch falha por motivo transitório, **antes** de a solicitação alcançar
 * qualquer lógica de domínio (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seções 4 e 13).
 *
 * Este artefato nunca duplica o Retry Manager já implementado em `@abp/automation-engine`
 * (`RetryPolicy.ts`, `RetryAttempt.ts`, Sprint 6.3): aquele opera sobre uma Action já em execução
 * *dentro* de um Workflow já despachado com sucesso; este opera exclusivamente sobre a falha do
 * próprio ato de encaminhar (Dispatch) uma solicitação — um nível de abstração estritamente anterior
 * e mais genérico. Uma vez que o Dispatch é bem-sucedido, nenhuma nova tentativa deste artefato é
 * aplicável; toda semântica de Retry subsequente pertence exclusivamente ao Automation Engine.
 * Nenhum tipo de `@abp/automation-engine` é importado por este arquivo.
 * Estrutura definida em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 4.
 */
export interface DispatchRetryAttempt {
  /** Identificador da tentativa. */
  readonly dispatchRetryAttemptId: string;

  /** Execution Context cujo Dispatch falhou — ver ExecutionContext.ts (Sprint 7.1). */
  readonly executionContextId: string;

  /** Dispatch Target cujo encaminhamento falhou — ver DispatchTarget.ts (Sprint 7.1). */
  readonly dispatchTargetId: string;

  /** Número sequencial da tentativa. */
  readonly attemptNumber: number;

  /** Momento da tentativa. */
  readonly attemptedAt: Date;
}
