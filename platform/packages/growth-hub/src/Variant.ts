/**
 * Variant — uma alternativa específica testada dentro de um Experiment.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Variant {
  /** Identificador da Variant. */
  readonly variantId: string;

  /** Experiment ao qual esta Variant pertence. */
  readonly experimentId: string;

  /** Nome da Variant. */
  readonly name: string;
}
