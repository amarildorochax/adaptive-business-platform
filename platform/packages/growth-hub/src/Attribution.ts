/**
 * Attribution — relaciona um Conversion Event à Campaign ou ao Acquisition Channel responsável por
 * sua origem; nunca é retroativamente reescrita sem novo Evento explícito — uma mudança de
 * Attribution Model se aplica a partir de sua entrada em vigor, nunca reinterpretando silenciosamente
 * conversão já atribuída (Attribution Is Immutable, Blueprint Capítulo 12).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Attribution {
  /** Identificador da Attribution. */
  readonly attributionId: string;

  /** Conversion Event ao qual esta Attribution se refere. */
  readonly conversionEventId: string;

  /** Attribution Model vigente no momento do cálculo. */
  readonly attributionModelId: string;

  /** Campaign ou Acquisition Channel de origem — identificador opaco. */
  readonly sourceId: string;

  /** Momento do cálculo — imutável a partir deste ponto. */
  readonly calculatedAt: Date;
}
