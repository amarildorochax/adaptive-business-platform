/**
 * Planning Constraint — uma restrição arquitetural aplicável a um plano; o Planning nunca executa,
 * ele mesmo, nenhuma etapa — apenas a planeja.
 * Estrutura definida em PLANNING_CONCRETE_STRUCTURE.md.
 */
export interface PlanningConstraint {
  /** Plano ao qual esta restrição se aplica. */
  readonly planId: string;

  /** Descrição da restrição arquitetural. */
  readonly description: string;
}
