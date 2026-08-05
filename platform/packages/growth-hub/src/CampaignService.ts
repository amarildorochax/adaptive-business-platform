import type { Campaign } from './Campaign';
import type { CampaignRepository } from './CampaignRepository';

/** Campos aceitos por `CampaignService.create()` — `audienceId` já deve referenciar uma Audience existente (ver GrowthManager.createCampaign). */
export type CreateCampaignInput = Pick<
  Campaign,
  'tenantId' | 'audienceId' | 'name' | 'description' | 'startDate' | 'endDate'
>;

/**
 * CampaignService — adaptado de `src/core/campaign/{CampaignService.ts, CampaignManager.ts}`
 * (Campaign Management legado, real e funcional, per IMP-005 Etapa 1) ao vocabulário e à forma já
 * aprovados em `GROWTH_DOMAIN_BLUEPRINT.md`/`GROWTH_HUB.md`: `CampaignStatus` legado tem apenas três
 * estados (`draft`/`active`/`finished`), o aprovado tem quatro (`Created`/`Running`/`Finished`/
 * `Stopped`) — esta Sprint nunca altera o vocabulário já Frozen do Blueprint, apenas porta os campos
 * práticos (`name`/`description`/`startDate`/`endDate`) que o legado já validava em produção. Nenhuma
 * emissão de Evento aqui — responsabilidade exclusiva de GrowthManager.
 */
export class CampaignService {
  constructor(private readonly repository: CampaignRepository) {}

  async create(input: CreateCampaignInput): Promise<Campaign> {
    const now = new Date();
    const campaign: Campaign = {
      campaignId: crypto.randomUUID(),
      status: 'Created',
      createdAt: now,
      updatedAt: now,
      ...input,
    };

    return this.repository.create(campaign);
  }

  async start(campaignId: string): Promise<Campaign> {
    const existing = await this.repository.get(campaignId);

    if (!existing) {
      throw new Error(`Campaign ${campaignId} não encontrada.`);
    }

    return this.repository.update({ ...existing, status: 'Running', updatedAt: new Date() });
  }

  /**
   * Encerra uma Campaign em execução. Transiciona para `Stopped` — nunca para `Finished`, que não
   * possui nenhum Command aprovado que o produza nesta Sprint (ver Nota de Posicionamento do
   * relatório desta Sprint).
   */
  async stop(campaignId: string): Promise<Campaign> {
    const existing = await this.repository.get(campaignId);

    if (!existing) {
      throw new Error(`Campaign ${campaignId} não encontrada.`);
    }

    return this.repository.update({ ...existing, status: 'Stopped', updatedAt: new Date() });
  }

  async get(campaignId: string): Promise<Campaign | undefined> {
    return this.repository.get(campaignId);
  }

  async list(tenantId: string): Promise<readonly Campaign[]> {
    return this.repository.list(tenantId);
  }
}
