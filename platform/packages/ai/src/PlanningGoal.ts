/**
 * Planning Goal — o objetivo de um plano, sempre explícito antes de qualquer decomposição.
 * Estrutura definida em PLANNING_CONCRETE_STRUCTURE.md.
 */
export interface PlanningGoal {
  /** Plano ao qual este objetivo pertence. */
  readonly planId: string;

  /** Identificador do objetivo. */
  readonly goalId: string;

  /** Descrição do que o objetivo deseja alcançar. */
  readonly description: string;
}
