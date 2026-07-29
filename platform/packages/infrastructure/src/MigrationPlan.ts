/**
 * Migration Plan — registro de um plano ou execução de migração de dado, gradual e verificável.
 * Estrutura definida em DATA_CONCRETE_STRUCTURE.md.
 */
export interface MigrationPlan {
  /** Identificador do plano de migração. */
  readonly id: string;

  /** Descrição da migração. */
  readonly description: string;

  /** Início da execução. */
  readonly startedAt: Date;

  /** Conclusão da execução, quando já finalizada. */
  readonly completedAt?: Date;
}
