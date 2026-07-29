/**
 * Attribution Model — define a regra estratégica de como o crédito de uma conversão é distribuído
 * entre múltiplos pontos de contato.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface AttributionModel {
  /** Identificador do Attribution Model. */
  readonly attributionModelId: string;

  /** Tenant ao qual este modelo se aplica. */
  readonly tenantId: string;

  /** Nome do modelo (ex.: primeiro toque, último toque, linear). */
  readonly name: string;
}
