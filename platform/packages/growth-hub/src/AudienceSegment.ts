/**
 * Audience Segment — uma subdivisão de uma Audience por critério estratégico comum, parte da mesma
 * lógica de segmentação de crescimento; distinta, na motivação e no uso, da segmentação de Business
 * Profile já definida em `BUSINESS_PROFILE_ENGINE.md` (Blueprint, Capítulo 5).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface AudienceSegment {
  /** Identificador do Audience Segment. */
  readonly audienceSegmentId: string;

  /** Audience à qual este Segment pertence. */
  readonly audienceId: string;

  /** Critério estratégico de segmentação. */
  readonly criterion: string;

  /** Momento do último recálculo de composição. */
  readonly updatedAt: Date;
}
