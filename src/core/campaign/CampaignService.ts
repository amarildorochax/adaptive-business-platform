import type { CampaignRecord } from "./CampaignRecord";
import type { CampaignAudience } from "./CampaignAudience";
import type { CampaignResult } from "./CampaignResult";
import { CampaignStore } from "./CampaignStore";

/** Campos aceitos por `CampaignService.create()`. */
export type CampaignInput = Pick<CampaignRecord, "name" | "description" | "startDate" | "endDate" | "metadata">;

/** Campos aceitos por `CampaignService.recordResult()` — tudo, exceto `createdAt` (definido pelo Service). */
export type CampaignResultInput = Omit<CampaignResult, "createdAt">;

/**
 * Cadastro, consulta, atualização, remoção, início e encerramento de
 * CampaignRecord (Tarefa 09) — mais dois métodos além do mínimo pedido
 * (`defineAudience`/`recordResult`), necessários para que
 * CampaignAudience/CampaignResult (Tarefas 05/07, exigidas nos
 * Critérios de Aceite) tenham algum caminho de escrita — mesmo
 * princípio já usado na Sprint 10A, onde `CRM.updateOpportunity()` foi
 * adicionado além do mínimo para que `CRM_OPPORTUNITY_UPDATED`
 * pudesse, de fato, ser emitido.
 *
 * Stateless em relação a eventos/métricas — nenhuma dependência de
 * EventBus ou CampaignMetrics (isso é responsabilidade de
 * CampaignManager).
 *
 * Dependências: CampaignStore (própria instância).
 *
 * Consumido exclusivamente por CampaignManager.
 */
export class CampaignService {
  private readonly store = new CampaignStore();

  /** Cria uma nova CampaignRecord — `status` inicia sempre em `"draft"`. */
  create(input: CampaignInput): CampaignRecord {
    const now = new Date();

    const campaign: CampaignRecord = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      status: "draft",
      startDate: input.startDate,
      endDate: input.endDate,
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.store.addCampaign(campaign);

    return campaign;
  }

  /** Atualiza os campos de `input` (parcial) na CampaignRecord de `id`. Retorna `undefined` se não existir. */
  update(id: string, input: Partial<CampaignInput>): CampaignRecord | undefined {
    const existing = this.store.getCampaign(id);

    if (!existing) {
      return undefined;
    }

    const updated: CampaignRecord = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };

    this.store.addCampaign(updated);

    return updated;
  }

  /** Remove a CampaignRecord de `id`. Retorna `false` se não existir. */
  remove(id: string): boolean {
    return this.store.removeCampaign(id);
  }

  /** Retorna a CampaignRecord de `id`, ou `undefined` se não existir. */
  get(id: string): CampaignRecord | undefined {
    return this.store.getCampaign(id);
  }

  /** Retorna todas as CampaignRecord já cadastradas. */
  list(): CampaignRecord[] {
    return this.store.getAllCampaigns();
  }

  /**
   * Inicia a CampaignRecord de `id` — `status` passa a `"active"`,
   * registra uma nova CampaignExecution (`status: "running"`). Retorna
   * `undefined` se a campanha não existir.
   */
  start(id: string): CampaignRecord | undefined {
    const existing = this.store.getCampaign(id);

    if (!existing) {
      return undefined;
    }

    const updated: CampaignRecord = { ...existing, status: "active", updatedAt: new Date() };
    this.store.addCampaign(updated);

    this.store.setExecution({
      campaignId: id,
      startedAt: new Date(),
      status: "running",
      notes: "",
    });

    return updated;
  }

  /**
   * Encerra a CampaignRecord de `id` — `status` passa a `"finished"`,
   * atualiza a CampaignExecution corrente (`status: "completed"`,
   * `finishedAt`). Retorna `undefined` se a campanha não existir.
   */
  finish(id: string): CampaignRecord | undefined {
    const existing = this.store.getCampaign(id);

    if (!existing) {
      return undefined;
    }

    const updated: CampaignRecord = { ...existing, status: "finished", updatedAt: new Date() };
    this.store.addCampaign(updated);

    const execution = this.store.getExecution(id);
    const finishedAt = new Date();

    this.store.setExecution({
      campaignId: id,
      startedAt: execution?.startedAt ?? finishedAt,
      finishedAt,
      status: "completed",
      notes: execution?.notes ?? "",
    });

    return updated;
  }

  /** Define o público-alvo da CampaignRecord de `campaignId` — `estimatedReach` é sempre `customerIds.length`. */
  defineAudience(campaignId: string, customerIds: string[]): CampaignAudience {
    const audience: CampaignAudience = {
      campaignId,
      customerIds,
      estimatedReach: customerIds.length,
      createdAt: new Date(),
    };

    this.store.setAudience(audience);

    return audience;
  }

  /** Retorna a CampaignAudience corrente da CampaignRecord de `campaignId`, ou `undefined` se nenhuma foi definida. */
  getAudience(campaignId: string): CampaignAudience | undefined {
    return this.store.getAudience(campaignId);
  }

  /** Registra um novo CampaignResult para `input.campaignId` (histórico, não substitui os anteriores). */
  recordResult(input: CampaignResultInput): CampaignResult {
    const result: CampaignResult = { ...input, createdAt: new Date() };
    this.store.addResult(result);

    return result;
  }

  /** Retorna o histórico de CampaignResult da CampaignRecord de `campaignId`. */
  listResults(campaignId: string): CampaignResult[] {
    return this.store.getResults(campaignId);
  }
}
