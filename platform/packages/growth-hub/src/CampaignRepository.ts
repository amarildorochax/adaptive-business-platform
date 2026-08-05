import type { Campaign } from './Campaign';

/**
 * Contrato de persistência de Campaign — apenas o contrato, per Etapa 7 desta Sprint (IMP-005).
 * Nenhum Command/Event aprovado cobre remoção de Campaign (`GrowthCommand.ts`/`GrowthEvent.ts`, 16 e
 * 17 respectivamente) — este contrato nunca declara `remove`.
 */
export interface CampaignRepository {
  create(campaign: Campaign): Promise<Campaign>;
  update(campaign: Campaign): Promise<Campaign>;
  get(campaignId: string): Promise<Campaign | undefined>;
  list(tenantId: string): Promise<Campaign[]>;
}
