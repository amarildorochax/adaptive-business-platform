/**
 * Campaign Goal — define o resultado esperado de uma Campaign, inseparável de sua estratégia.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 4.
 */
export interface CampaignGoal {
  /** Identificador do Campaign Goal. */
  readonly campaignGoalId: string;

  /** Campaign à qual este objetivo pertence. */
  readonly campaignId: string;

  /** Descrição do resultado esperado. */
  readonly description: string;
}
