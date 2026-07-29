/**
 * Referral Program — define a estrutura estratégica de incentivo à indicação.
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface ReferralProgram {
  /** Identificador do Referral Program. */
  readonly referralProgramId: string;

  /** Tenant ao qual este programa pertence. */
  readonly tenantId: string;

  /** Descrição da regra de incentivo. */
  readonly incentiveDescription: string;
}
