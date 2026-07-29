import { eventBus } from "@/core/events/EventBus";
import { EventTypes } from "@/core/events/EventTypes";
import type { CampaignRecord } from "./CampaignRecord";
import type { CampaignAudience } from "./CampaignAudience";
import type { CampaignResult } from "./CampaignResult";
import { CampaignService, type CampaignInput, type CampaignResultInput } from "./CampaignService";
import { CampaignMetrics, type CampaignMetricsSnapshot } from "./CampaignMetrics";

/**
 * Coordena todas as operações de CampaignRecord (Tarefa 03) — delega
 * cadastro/consulta/atualização/remoção/início/encerramento a
 * CampaignService, registra CampaignMetrics e emite os eventos de ciclo
 * de vida (CAMPAIGN_CREATED/UPDATED/REMOVED/STARTED/FINISHED).
 *
 * Nunca contém regra de Marketing ou de CRM, e nunca acessa IA — apenas
 * coordena CampaignService e a infraestrutura cross-cutting (EventBus,
 * CampaignMetrics). Não emite evento para `defineAudience()`/
 * `recordResult()` — apenas os cinco eventos explicitamente pedidos
 * pela Tarefa 11.
 *
 * Consumido exclusivamente por Campaign (fachada).
 */
export class CampaignManager {
  private readonly service = new CampaignService();

  private readonly metrics = new CampaignMetrics();

  /** Cria uma nova CampaignRecord. */
  createCampaign(input: CampaignInput): CampaignRecord {
    const campaign = this.service.create(input);
    this.metrics.recordMutation();

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.CAMPAIGN_CREATED,
      source: "CampaignManager",
      payload: { id: campaign.id, status: campaign.status },
      createdAt: campaign.createdAt,
    });

    return campaign;
  }

  /** Atualiza uma CampaignRecord já existente (parcial). Retorna `undefined` se não existir. */
  updateCampaign(id: string, input: Partial<CampaignInput>): CampaignRecord | undefined {
    const updated = this.service.update(id, input);

    if (updated) {
      this.metrics.recordMutation();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.CAMPAIGN_UPDATED,
        source: "CampaignManager",
        payload: { id: updated.id },
        createdAt: updated.updatedAt,
      });
    }

    return updated;
  }

  /** Remove uma CampaignRecord. Retorna `false` se não existir. */
  removeCampaign(id: string): boolean {
    const removed = this.service.remove(id);

    if (removed) {
      this.metrics.recordMutation();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.CAMPAIGN_REMOVED,
        source: "CampaignManager",
        payload: { id },
        createdAt: new Date(),
      });
    }

    return removed;
  }

  /** Retorna a CampaignRecord de `id`, ou `undefined` se não existir. Registra consulta. */
  getCampaign(id: string): CampaignRecord | undefined {
    this.metrics.recordQuery();
    return this.service.get(id);
  }

  /** Retorna todas as CampaignRecord cadastradas. Registra consulta. */
  listCampaigns(): CampaignRecord[] {
    this.metrics.recordQuery();
    return this.service.list();
  }

  /** Inicia uma CampaignRecord. Retorna `undefined` se não existir. */
  startCampaign(id: string): CampaignRecord | undefined {
    const started = this.service.start(id);

    if (started) {
      this.metrics.recordExecution();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.CAMPAIGN_STARTED,
        source: "CampaignManager",
        payload: { id: started.id },
        createdAt: started.updatedAt,
      });
    }

    return started;
  }

  /** Encerra uma CampaignRecord. Retorna `undefined` se não existir. */
  finishCampaign(id: string): CampaignRecord | undefined {
    const finished = this.service.finish(id);

    if (finished) {
      this.metrics.recordMutation();

      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.CAMPAIGN_FINISHED,
        source: "CampaignManager",
        payload: { id: finished.id },
        createdAt: finished.updatedAt,
      });
    }

    return finished;
  }

  /** Define o público-alvo de uma CampaignRecord. */
  defineAudience(campaignId: string, customerIds: string[]): CampaignAudience {
    return this.service.defineAudience(campaignId, customerIds);
  }

  /** Registra um novo CampaignResult. */
  recordResult(input: CampaignResultInput): CampaignResult {
    return this.service.recordResult(input);
  }

  /** Retorna o histórico de CampaignResult de uma CampaignRecord. Registra consulta. */
  listResults(campaignId: string): CampaignResult[] {
    this.metrics.recordQuery();
    return this.service.listResults(campaignId);
  }

  /** Métricas agregadas de uso do Campaign Management. */
  getMetrics(): CampaignMetricsSnapshot {
    const campaigns = this.service.list();

    return this.metrics.snapshot({
      campaigns: campaigns.length,
      activeCampaigns: campaigns.filter((campaign) => campaign.status === "active").length,
      finishedCampaigns: campaigns.filter((campaign) => campaign.status === "finished").length,
    });
  }
}
