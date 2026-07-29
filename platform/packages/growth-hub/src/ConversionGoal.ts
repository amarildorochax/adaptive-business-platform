/**
 * Conversion Goal — define o resultado que caracteriza sucesso dentro de um Funnel ou de uma
 * Campaign.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface ConversionGoal {
  /** Identificador do Conversion Goal. */
  readonly conversionGoalId: string;

  /** Descrição do resultado que caracteriza sucesso. */
  readonly description: string;
}
