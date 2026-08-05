import type { CampaignGoal } from './CampaignGoal';
import type { CampaignGoalRepository } from './CampaignGoalRepository';

/**
 * CampaignGoalService — nenhum precedente legado equivalente foi encontrado (`src/core/campaign` não
 * modela objetivo como Entidade própria; `CampaignResult`/`CampaignMetrics` são retratos de
 * desempenho pós-execução, não o objetivo declarado antes dela — ver relatório desta Sprint).
 * Nenhuma emissão de Evento aqui — responsabilidade exclusiva de GrowthManager.
 */
export class CampaignGoalService {
  constructor(private readonly repository: CampaignGoalRepository) {}

  async create(campaignId: string, description: string): Promise<CampaignGoal> {
    const campaignGoal: CampaignGoal = {
      campaignGoalId: crypto.randomUUID(),
      campaignId,
      description,
    };

    return this.repository.create(campaignGoal);
  }

  async get(campaignGoalId: string): Promise<CampaignGoal | undefined> {
    return this.repository.get(campaignGoalId);
  }

  async list(campaignId: string): Promise<readonly CampaignGoal[]> {
    return this.repository.list(campaignId);
  }
}
