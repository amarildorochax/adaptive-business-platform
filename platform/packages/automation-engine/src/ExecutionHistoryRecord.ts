/**
 * Execution History Record — o registro completo, preservado pelo Execution History, de toda
 * Execution já concluída, bem-sucedida ou falha, sustentando Auditabilidade e investigação de
 * incidente (`AUTOMATION_ENGINE.md`, Capítulo 7).
 * `outcome` distingue explicitamente três resultados, nunca apenas dois — um Branch não satisfeito é
 * "NoActionTaken" (conclusão sem ação), nunca "Failure": "o Execution History distingue
 * explicitamente entre um Workflow que concluiu sem executar nenhuma Action, por nenhuma Condition
 * ter sido satisfeita, e um Workflow que falhou ao tentar executar uma Action" (`AUTOMATION_ENGINE.md`,
 * ADR-012).
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7 e Capítulo 8.
 */
export type ExecutionOutcome = "Success" | "NoActionTaken" | "Failure";

export interface ExecutionHistoryRecord {
  /** Execution registrada. */
  readonly executionId: string;

  /** Workflow ao qual esta Execution se refere. */
  readonly workflowId: string;

  /** Resultado final — nunca confundindo "sem ação" com "falha" (ADR-012). */
  readonly outcome: ExecutionOutcome;

  /** Momento da conclusão. */
  readonly completedAt: Date;
}
