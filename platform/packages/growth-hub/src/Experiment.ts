/**
 * Experiment — a estrutura de testagem de uma hipótese estratégica de crescimento; sempre possui um
 * Conversion Goal explícito antes de seu início (Blueprint, Capítulo 12). A/B Test, catalogado em
 * `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 4, como "um tipo específico de Experiment, parte do mesmo
 * conceito de experimentação", não é modelado como Entidade separada — é, por definição, um
 * Experiment cujo conjunto de Variant tem exatamente dois elementos, sem exigir nenhum campo
 * estrutural adicional. Esta reconciliação reduz as trinta menções conceituais de
 * `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 4, às vinte e nove Entidades já confirmadas no Capítulo 16
 * daquele documento.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type ExperimentStatus = "Created" | "Running" | "Finished";

export interface Experiment {
  /** Identificador do Experiment. */
  readonly experimentId: string;

  /** Tenant ao qual o Experiment pertence. */
  readonly tenantId: string;

  /** Conversion Goal explícito — obrigatório antes do início. */
  readonly conversionGoalId: string;

  /** Variants testadas — um Experiment com exatamente duas é, por definição, um A/B Test. */
  readonly variantIds: readonly string[];

  /** Estado atual. */
  readonly status: ExperimentStatus;

  /** Variant vencedora, quando já selecionada ao encerramento. */
  readonly winningVariantId?: string;

  /** Momento de criação. */
  readonly createdAt: Date;
}
