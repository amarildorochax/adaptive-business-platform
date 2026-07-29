/**
 * Campaign — a unidade central de iniciativa de crescimento, responsável por reunir um objetivo, um
 * período de execução e uma Audience-alvo; toda Campaign possui Audience explicitamente definida
 * antes de seu início (Blueprint, Capítulo 12).
 * Estrutura definida em `GROWTH_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type CampaignStatus = "Created" | "Running" | "Finished" | "Stopped";

export interface Campaign {
  /** Identificador da Campaign. */
  readonly campaignId: string;

  /** Tenant ao qual a Campaign pertence. */
  readonly tenantId: string;

  /** Audience-alvo — sempre definida antes do início. */
  readonly audienceId: string;

  /** Estado atual. */
  readonly status: CampaignStatus;

  /** Momento de criação. */
  readonly createdAt: Date;
}
