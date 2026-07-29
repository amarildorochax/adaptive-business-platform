/**
 * Finance Validation Result — o resultado da verificação de que um Command respeita toda Regra de
 * negócio já fixada no Blueprint antes de seu processamento (Validation Engine, `FINANCE_HUB.md`,
 * Capítulo 9).
 * Estrutura definida em `FINANCE_HUB.md`, Capítulo 9.
 */
export interface FinValidationResult {
  /** Comando validado — mesmo identificador de `FinCommand.operationId`. */
  readonly operationId: string;

  /** Se o Comando respeita toda Regra de negócio aplicável. */
  readonly valid: boolean;

  /** Regras de negócio violadas, quando inválido — ver FinBusinessRule.ts. */
  readonly violatedRuleIds: readonly string[];

  /** Momento da validação. */
  readonly validatedAt: Date;
}
