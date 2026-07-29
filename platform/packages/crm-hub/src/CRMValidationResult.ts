/**
 * CRM Validation Result — o resultado da verificação, pelo Validation Engine, de que um Command
 * respeita toda Regra de negócio já fixada no Blueprint antes de seu processamento (Validation at
 * the Boundary, `CRM_HUB.md` Capítulo 5).
 * Estrutura definida em `CRM_HUB.md`, Capítulo 7.
 */
export interface CRMValidationResult {
  /** Comando validado — mesmo identificador de `CRMCommand.operationId`. */
  readonly operationId: string;

  /** Se o Comando respeita toda Regra de negócio aplicável. */
  readonly valid: boolean;

  /** Regras de negócio violadas, quando inválido — ver CRMBusinessRule.ts. */
  readonly violatedRuleIds: readonly string[];

  /** Momento da validação. */
  readonly validatedAt: Date;
}
