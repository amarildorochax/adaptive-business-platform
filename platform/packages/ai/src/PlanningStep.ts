/**
 * Planning Step — uma etapa resultante da decomposição de um objetivo, sempre pequena o suficiente
 * para ser delegada de forma isolada, com dependências e prioridade que respeitam toda relação de
 * precedência real já identificada.
 * Estrutura definida em PLANNING_CONCRETE_STRUCTURE.md.
 */
export interface PlanningStep {
  /** Plano ao qual esta etapa pertence. */
  readonly planId: string;

  /** Identificador da etapa. */
  readonly stepId: string;

  /** Identificadores de etapa dos quais esta etapa depende. */
  readonly dependsOn: readonly string[];

  /** Prioridade de processamento desta etapa. */
  readonly priority: number;

  /** Condições que devem estar satisfeitas antes desta etapa. */
  readonly preconditions: readonly string[];

  /** Condições produzidas pela conclusão desta etapa. */
  readonly postconditions: readonly string[];

  /** Critérios que determinam a conclusão desta etapa. */
  readonly completionCriteria: readonly string[];
}
