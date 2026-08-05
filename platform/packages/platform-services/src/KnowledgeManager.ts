import type { Command, Event } from "@abp/core";
import type { ArchiveKnowledgePayload } from "./ArchiveKnowledgePayload.js";
import type { CreateKnowledgePayload } from "./CreateKnowledgePayload.js";
import type { IndexKnowledgePayload } from "./IndexKnowledgePayload.js";
import type { KnowledgeArchivedPayload } from "./KnowledgeArchivedPayload.js";
import type { KnowledgeAsset } from "./KnowledgeAsset.js";
import { KnowledgeAssetService } from "./KnowledgeAssetService.js";
import type { KnowledgeCreatedPayload } from "./KnowledgeCreatedPayload.js";
import type { KnowledgeIndexedPayload } from "./KnowledgeIndexedPayload.js";
import { KnowledgeIndexService } from "./KnowledgeIndexService.js";
import type { KnowledgeLifecycleStage, KnowledgeLifecycleState } from "./KnowledgeLifecycleState.js";
import { KnowledgeLifecycleService } from "./KnowledgeLifecycleService.js";
import { KnowledgeSearchService } from "./KnowledgeSearchService.js";
import type { KnowledgeUpdatedPayload } from "./KnowledgeUpdatedPayload.js";
import type { KnowledgeVersion } from "./KnowledgeVersion.js";
import { KnowledgeVersionService } from "./KnowledgeVersionService.js";
import type { SearchQuery, SearchResult } from "./Search.js";
import type { UpdateKnowledgePayload } from "./UpdateKnowledgePayload.js";

export interface KnowledgeManagerDependencies {
  readonly assets: KnowledgeAssetService;
  readonly lifecycle: KnowledgeLifecycleService;
  readonly versions: KnowledgeVersionService;
  readonly index: KnowledgeIndexService;
  readonly search: KnowledgeSearchService;
}

/**
 * Resultado de uma operação de KnowledgeManager. `command`/`events` estão presentes exatamente nas
 * quatro operações cujo Command já está catalogado em `COMMAND_CATALOG.md` (CreateKnowledge,
 * UpdateKnowledge, IndexKnowledge, ArchiveKnowledge) — diferente de todo domínio migrado desde a
 * IMP-010 (AI Hub, IAM, Observability, Runtime, AI Agents), o Knowledge Hub **tem** catálogo formal de
 * Command e de Event, mesmo padrão `{result, command?, events}` já usado por CRM/Communication/
 * Finance/Growth. Toda transição de estágio sem Command catalogado (`submitForReview`, `approve`,
 * `publish`, `markInUse`, `resumeReview`, `recoverKnowledge`) retorna apenas `{result}`.
 */
export interface KnowledgeOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command?: Command<unknown>;
  readonly events?: readonly Event<unknown>[];
}

let commandSequence = 0;
let eventSequence = 0;

function buildCommand<TPayload>(name: string, payload: TPayload): Command<TPayload> {
  commandSequence += 1;
  return { name, submissionId: `knowledge-cmd-${commandSequence}`, payload, contractVersion: "v1" };
}

function buildEvent<TPayload>(name: string, aggregateId: string, payload: TPayload): Event<TPayload> {
  eventSequence += 1;
  return { id: `knowledge-evt-${eventSequence}`, occurredAt: new Date(), aggregateId, contractVersion: "v1", name, payload };
}

/**
 * KnowledgeManager — implementa o "Knowledge Manager" (`KNOWLEDGE_HUB.md`, Capítulo 7): "o ponto de
 * entrada e orquestrador central do Knowledge Hub... coordena os demais componentes especializados e
 * garante consistência... sem decidir, ele mesmo, a lógica de classificação, de indexação ou de
 * busca." Aplica literalmente o Ciclo de Vida do Capítulo 9.
 */
export class KnowledgeManager {
  constructor(private readonly deps: KnowledgeManagerDependencies) {}

  /** Command "CreateKnowledge" — cria o Asset, registra a Versão 1, e inicia o Ciclo de Vida em "Criação". */
  async createKnowledge(payload: CreateKnowledgePayload): Promise<KnowledgeOperationResult<KnowledgeAsset>> {
    const asset = await this.deps.assets.create(payload.tenantId, payload.type, payload.category, payload.tags);
    await this.deps.versions.record(asset.assetId);
    await this.deps.lifecycle.start(asset.assetId);

    const command = buildCommand<CreateKnowledgePayload>("CreateKnowledge", payload);
    const events = [buildEvent<KnowledgeCreatedPayload>("KnowledgeCreated", asset.assetId, { assetId: asset.assetId, tenantId: asset.tenantId, type: asset.type })];

    return { result: asset, command, events };
  }

  async submitForReview(assetId: string): Promise<KnowledgeOperationResult<KnowledgeLifecycleState>> {
    return { result: await this.deps.lifecycle.advance(assetId, "Revisão") };
  }

  async approve(assetId: string): Promise<KnowledgeOperationResult<KnowledgeLifecycleState>> {
    return { result: await this.deps.lifecycle.advance(assetId, "Aprovação") };
  }

  async publish(assetId: string): Promise<KnowledgeOperationResult<KnowledgeLifecycleState>> {
    return { result: await this.deps.lifecycle.advance(assetId, "Publicação") };
  }

  /** Command "IndexKnowledge" — publica apenas "KnowledgeIndexed" (ver Lacunas Arquiteturais quanto a "SemanticIndexUpdated"). */
  async indexKnowledge(payload: IndexKnowledgePayload): Promise<KnowledgeOperationResult<KnowledgeLifecycleState>> {
    const entry = await this.deps.index.index(payload.assetId);
    const state = await this.deps.lifecycle.advance(payload.assetId, "Indexação");

    const command = buildCommand<IndexKnowledgePayload>("IndexKnowledge", payload);
    const events = [buildEvent<KnowledgeIndexedPayload>("KnowledgeIndexed", payload.assetId, { assetId: payload.assetId, tenantId: payload.tenantId, indexedAt: entry.indexedAt })];

    return { result: state, command, events };
  }

  async markInUse(assetId: string): Promise<KnowledgeOperationResult<KnowledgeLifecycleState>> {
    return { result: await this.deps.lifecycle.advance(assetId, "Uso") };
  }

  /** Command "UpdateKnowledge" — registra nova Versão e avança o Ciclo de Vida para "Atualização". */
  async updateKnowledge(payload: UpdateKnowledgePayload): Promise<KnowledgeOperationResult<KnowledgeVersion>> {
    const version = await this.deps.versions.record(payload.assetId);
    await this.deps.lifecycle.advance(payload.assetId, "Atualização");

    const command = buildCommand<UpdateKnowledgePayload>("UpdateKnowledge", payload);
    const events = [buildEvent<KnowledgeUpdatedPayload>("KnowledgeUpdated", payload.assetId, { assetId: payload.assetId, tenantId: payload.tenantId, version: version.version })];

    return { result: version, command, events };
  }

  /** "A transição de Uso... continua sujeito a nova Revisão a qualquer momento" (Capítulo 9) — nunca automática. */
  async resumeReview(assetId: string): Promise<KnowledgeOperationResult<KnowledgeLifecycleState>> {
    return { result: await this.deps.lifecycle.advance(assetId, "Revisão") };
  }

  /** Command "ArchiveKnowledge". */
  async archiveKnowledge(payload: ArchiveKnowledgePayload): Promise<KnowledgeOperationResult<KnowledgeLifecycleState>> {
    const state = await this.deps.lifecycle.advance(payload.assetId, "Arquivamento");

    const command = buildCommand<ArchiveKnowledgePayload>("ArchiveKnowledge", payload);
    const events = [buildEvent<KnowledgeArchivedPayload>("KnowledgeArchived", payload.assetId, { assetId: payload.assetId, tenantId: payload.tenantId, reason: payload.reason })];

    return { result: state, command, events };
  }

  /** "Knowledge Recovery... é sempre um ato de escolha, nunca um efeito colateral automático" — nenhum Command/Event catalogado (ver Lacunas Arquiteturais). */
  async recoverKnowledge(assetId: string): Promise<KnowledgeOperationResult<KnowledgeLifecycleState>> {
    return { result: await this.deps.lifecycle.advance(assetId, "Recuperação") };
  }

  async currentStage(assetId: string): Promise<KnowledgeOperationResult<KnowledgeLifecycleStage | undefined>> {
    return { result: await this.deps.lifecycle.currentStage(assetId) };
  }

  /** Retrieval Engine — nunca gera resposta (Generation permanece exclusivamente do AI Hub, ADR-006). */
  async search(query: SearchQuery): Promise<KnowledgeOperationResult<readonly SearchResult[]>> {
    return { result: await this.deps.search.search(query) };
  }
}
