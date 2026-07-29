/**
 * Growth Validation Result — o resultado da verificação de que um Command respeita toda Regra de
 * negócio já fixada no Blueprint antes de seu processamento (Validation Engine, `GROWTH_HUB.md`,
 * Capítulo 6).
 * Estrutura definida em `GROWTH_HUB.md`, Capítulo 6.
 */
export interface GrowthValidationResult {
  /** Comando validado — mesmo identificador de `GrowthCommand.operationId`. */
  readonly operationId: string;

  /** Se o Comando respeita toda Regra de negócio aplicável. */
  readonly valid: boolean;

  /** Regras de negócio violadas, quando inválido — ver GrowthBusinessRule.ts. */
  readonly violatedRuleIds: readonly string[];

  /** Momento da validação. */
  readonly validatedAt: Date;
}
