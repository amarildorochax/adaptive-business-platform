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

  /**
   * Nome da Campaign. Campo prático herdado de `src/core/campaign/CampaignRecord.ts` (Campaign
   * Management legado, real e funcional) — ausente do Blueprint original, adicionado por precedente
   * já estabelecido em IMP-002 (Organization/Customer/Lead/Contact/Opportunity, ST-004).
   */
  readonly name: string;

  /** Descrição da Campaign — mesma origem de `name`. */
  readonly description?: string;

  /** Início planejado — mesma origem de `name`. */
  readonly startDate?: Date;

  /** Fim planejado — mesma origem de `name`. */
  readonly endDate?: Date;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última mudança de estado — necessário para Start/Stop, mesma origem de `name`. */
  readonly updatedAt: Date;
}
