/**
 * Reaction — resposta rápida e não textual a uma Message específica, quando o Canal suporta esse
 * recurso.
 * Estrutura definida em `COMMUNICATION_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Reaction {
  /** Identificador da Reaction. */
  readonly reactionId: string;

  /** Message à qual esta Reaction se refere. */
  readonly messageId: string;

  /** Tipo de reação (ex.: emoji), representado de forma opaca. */
  readonly kind: string;

  /** Momento do registro. */
  readonly reactedAt: Date;
}
