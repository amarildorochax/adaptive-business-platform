/**
 * Communication Validation Result — o resultado da verificação de que um Command respeita toda Regra
 * de negócio já fixada no Blueprint antes de seu processamento, um dos três Domain Services centrais
 * do Communication Hub (Validation, Retry Policy, Communication Policy — `COMMUNICATION_HUB.md`,
 * Capítulo 6).
 * Estrutura definida em `COMMUNICATION_HUB.md`, Capítulo 6.
 */
export interface CommValidationResult {
  /** Comando validado — mesmo identificador de `CommCommand.operationId`. */
  readonly operationId: string;

  /** Se o Comando respeita toda Regra de negócio aplicável. */
  readonly valid: boolean;

  /** Regras de negócio violadas, quando inválido — ver CommBusinessRule.ts. */
  readonly violatedRuleIds: readonly string[];

  /** Momento da validação. */
  readonly validatedAt: Date;
}
