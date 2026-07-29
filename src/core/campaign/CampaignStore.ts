import type { CampaignRecord } from "./CampaignRecord";
import type { CampaignAudience } from "./CampaignAudience";
import type { CampaignExecution } from "./CampaignExecution";
import type { CampaignResult } from "./CampaignResult";

/**
 * Armazenamento de CampaignRecord/CampaignAudience/CampaignExecution/
 * CampaignResult — exclusivamente em memória (`Map`), sem persistência,
 * sem banco (Tarefa 08). Único Store desta Sprint — guarda as quatro
 * entidades do domínio (ver ARQUITETURA: Store fica logicamente acima
 * das quatro), cada uma em seu próprio `Map`, indexado por `id`
 * (CampaignRecord) ou por `campaignId` (as outras três).
 *
 * `audiences`/`executions` guardam um registro "corrente" por
 * `campaignId` — uma nova chamada substitui a anterior. `results` é
 * histórico (array por `campaignId`) — CampaignResult representa um
 * retrato pontual, e uma CampaignRecord pode acumular vários ao longo
 * do tempo.
 *
 * Responsabilidade: guardar e recuperar por identificador — nenhuma
 * regra de negócio (isso é responsabilidade de CampaignService) e
 * nenhuma emissão de evento (isso é responsabilidade de
 * CampaignManager).
 *
 * Consumido exclusivamente por CampaignService.
 */
export class CampaignStore {
  private campaigns = new Map<string, CampaignRecord>();

  private audiences = new Map<string, CampaignAudience>();

  private executions = new Map<string, CampaignExecution>();

  private results = new Map<string, CampaignResult[]>();

  /** Adiciona (ou substitui, se já existir o mesmo `id`) uma CampaignRecord. */
  addCampaign(campaign: CampaignRecord): void {
    this.campaigns.set(campaign.id, campaign);
  }

  /** Retorna a CampaignRecord de `id`, ou `undefined` se não existir. */
  getCampaign(id: string): CampaignRecord | undefined {
    return this.campaigns.get(id);
  }

  /** Retorna todas as CampaignRecord já armazenadas. */
  getAllCampaigns(): CampaignRecord[] {
    return Array.from(this.campaigns.values());
  }

  /** Remove a CampaignRecord de `id`. Retorna `false` se não existir. */
  removeCampaign(id: string): boolean {
    return this.campaigns.delete(id);
  }

  /** Define (ou substitui) a CampaignAudience corrente de `audience.campaignId`. */
  setAudience(audience: CampaignAudience): void {
    this.audiences.set(audience.campaignId, audience);
  }

  /** Retorna a CampaignAudience corrente de `campaignId`, ou `undefined` se nenhuma foi definida. */
  getAudience(campaignId: string): CampaignAudience | undefined {
    return this.audiences.get(campaignId);
  }

  /** Define (ou substitui) a CampaignExecution corrente de `execution.campaignId`. */
  setExecution(execution: CampaignExecution): void {
    this.executions.set(execution.campaignId, execution);
  }

  /** Retorna a CampaignExecution corrente de `campaignId`, ou `undefined` se nenhuma existir. */
  getExecution(campaignId: string): CampaignExecution | undefined {
    return this.executions.get(campaignId);
  }

  /** Acrescenta um CampaignResult ao histórico de `result.campaignId`. */
  addResult(result: CampaignResult): void {
    const existing = this.results.get(result.campaignId) ?? [];
    existing.push(result);
    this.results.set(result.campaignId, existing);
  }

  /** Retorna o histórico de CampaignResult de `campaignId` (vazio se nenhum foi registrado). */
  getResults(campaignId: string): CampaignResult[] {
    return this.results.get(campaignId) ?? [];
  }

  /** Remove todos os dados armazenados (as quatro entidades). */
  clear(): void {
    this.campaigns.clear();
    this.audiences.clear();
    this.executions.clear();
    this.results.clear();
  }
}
