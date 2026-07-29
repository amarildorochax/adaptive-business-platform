/**
 * Lead Source — identifica a origem estratégica de um potencial Cliente, dado de crescimento por
 * natureza.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface LeadSource {
  /** Identificador do Lead Source. */
  readonly leadSourceId: string;

  /** Nome da origem. */
  readonly name: string;
}
