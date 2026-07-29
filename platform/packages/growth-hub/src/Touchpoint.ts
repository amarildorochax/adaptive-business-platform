/**
 * Touchpoint — um ponto específico de contato dentro de uma Journey.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Touchpoint {
  /** Identificador do Touchpoint. */
  readonly touchpointId: string;

  /** Journey à qual este Touchpoint pertence. */
  readonly journeyId: string;

  /** Posição de ordem dentro da Journey. */
  readonly order: number;
}
