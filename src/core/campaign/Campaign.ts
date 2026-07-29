import type { CampaignRecord } from "./CampaignRecord";
import type { CampaignAudience } from "./CampaignAudience";
import type { CampaignResult } from "./CampaignResult";
import { CampaignManager } from "./CampaignManager";
import type { CampaignInput, CampaignResultInput } from "./CampaignService";
import type { CampaignMetricsSnapshot } from "./CampaignMetrics";

/**
 * Fachada pública única do Campaign Management (Tarefa 02) — a fonte
 * oficial de campanhas da plataforma.
 *
 * ```
 * Application
 *    ↓
 * Campaign.createCampaign/updateCampaign/removeCampaign/getCampaign/
 *          listCampaigns/startCampaign/finishCampaign/getMetrics  ← única fachada
 *          (+ defineAudience/recordResult/listResults, além do mínimo — ver CampaignService.ts)
 *    ↓
 * CampaignManager     ← coordena; nunca regra de Marketing/CRM; nunca acessa IA
 *    ↓
 * CampaignService
 *    ↓
 * CampaignStore
 *    ↓
 * CampaignRecord · CampaignAudience · CampaignExecution · CampaignResult
 * ```
 *
 * Não executa campanhas, não envia mensagens, não usa IA, não integra
 * nenhuma API externa — apenas o domínio responsável pelos dados das
 * campanhas, em memória (sem persistência).
 *
 * Este módulo não consome CRM nem Marketing (e nenhum dos dois foi
 * alterado nesta Sprint) — `CampaignAudience.customerIds` não é
 * validado contra `crm.listCustomers()`. A futura substituição de
 * `CampaignProvider.listCampaigns()` (`@/core/marketing`, hoje sempre
 * `[]`) por uma leitura real deste módulo é trabalho de uma Sprint
 * futura, assim como a integração com Workflow Engine (ver diagrama do
 * prompt: "Workflow (futuro)").
 *
 * Responsabilidade: nenhum consumidor deve importar CampaignManager,
 * CampaignService ou CampaignStore diretamente — todos usam
 * exclusivamente esta fachada.
 *
 * Dependências: CampaignManager.
 */
export class Campaign {
  private readonly manager = new CampaignManager();

  /** Cria uma nova CampaignRecord (`status` inicia em `"draft"`). */
  createCampaign(input: CampaignInput): CampaignRecord {
    return this.manager.createCampaign(input);
  }

  /** Atualiza uma CampaignRecord já existente (parcial). */
  updateCampaign(id: string, input: Partial<CampaignInput>): CampaignRecord | undefined {
    return this.manager.updateCampaign(id, input);
  }

  /** Remove uma CampaignRecord. Retorna `false` se não existir. */
  removeCampaign(id: string): boolean {
    return this.manager.removeCampaign(id);
  }

  /** Recupera uma CampaignRecord por `id`, ou `undefined` se não existir. */
  getCampaign(id: string): CampaignRecord | undefined {
    return this.manager.getCampaign(id);
  }

  /** Retorna todas as CampaignRecord cadastradas. */
  listCampaigns(): CampaignRecord[] {
    return this.manager.listCampaigns();
  }

  /** Inicia uma CampaignRecord (`status` passa a `"active"`). */
  startCampaign(id: string): CampaignRecord | undefined {
    return this.manager.startCampaign(id);
  }

  /** Encerra uma CampaignRecord (`status` passa a `"finished"`). */
  finishCampaign(id: string): CampaignRecord | undefined {
    return this.manager.finishCampaign(id);
  }

  /** Define o público-alvo de uma CampaignRecord. */
  defineAudience(campaignId: string, customerIds: string[]): CampaignAudience {
    return this.manager.defineAudience(campaignId, customerIds);
  }

  /** Registra um novo CampaignResult para uma CampaignRecord. */
  recordResult(input: CampaignResultInput): CampaignResult {
    return this.manager.recordResult(input);
  }

  /** Retorna o histórico de CampaignResult de uma CampaignRecord. */
  listResults(campaignId: string): CampaignResult[] {
    return this.manager.listResults(campaignId);
  }

  /** Métricas agregadas de uso do Campaign Management. */
  getMetrics(): CampaignMetricsSnapshot {
    return this.manager.getMetrics();
  }
}

/** Instância única e compartilhada do Campaign para toda a plataforma. */
export const campaign = new Campaign();
