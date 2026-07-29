/**
 * Condition Expression — os operadores lógicos AND, OR e NOT que combinam múltiplas Condition
 * individuais em uma expressão condicional completa: todas as condições combinadas por AND precisam
 * ser verdadeiras, ao menos uma combinada por OR precisa ser verdadeira, e NOT inverte o resultado de
 * uma Condition específica.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 10.
 */
export type ConditionOperator = "AND" | "OR" | "NOT";

export interface ConditionExpression {
  /** Identificador da Condition Expression. */
  readonly conditionExpressionId: string;

  /** Operador lógico aplicado. */
  readonly operator: ConditionOperator;

  /** Conditions combinadas por este operador — ver Condition.ts. */
  readonly conditionIds: readonly string[];
}
