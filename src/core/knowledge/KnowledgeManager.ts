import type { KnowledgeDocument } from "./KnowledgeDocument";
import { KnowledgeStore } from "./KnowledgeStore";
import { KnowledgeSearch } from "./KnowledgeSearch";
import { KnowledgeMetrics, type KnowledgeMetricsSnapshot } from "./KnowledgeMetrics";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";

/** Campos aceitos por `KnowledgeManager.createDocument()` — os seis campos que o chamador de fato decide. */
export type KnowledgeDocumentInput = Pick<
  KnowledgeDocument,
  "title" | "content" | "summary" | "category" | "tags" | "metadata" | "status"
>;

/**
 * CRUD, versionamento, organização, categorias, métricas, e eventos de
 * KnowledgeDocument (Tarefa 02/03) — mesmo papel que `MemoryManager`
 * cumpre para MemoryRecord.
 *
 * Responsabilidade: único componente que escreve em KnowledgeStore — é
 * aqui, e somente aqui, que `version` é incrementado, que
 * `KNOWLEDGE_CREATED/UPDATED/REMOVED/SEARCHED/ACCESSED` são emitidos no
 * EventBus, e que a duração de cada consulta é registrada em
 * KnowledgeMetrics. Toda leitura (inclusive `getDocument`/`list`) passa
 * por KnowledgeSearch — nunca por `store.getAll()`/`store.get()`
 * diretamente (Tarefa 07/08 — "toda consulta deve passar por
 * KnowledgeSearch").
 *
 * Dependências: KnowledgeStore, KnowledgeSearch, KnowledgeMetrics,
 * EventBus/EventTypes.
 *
 * Consumido exclusivamente por KnowledgeBase — nenhum outro componente
 * deve manter sua própria instância de KnowledgeManager.
 */
export class KnowledgeManager {
  private readonly store = new KnowledgeStore();

  private readonly knowledgeSearch = new KnowledgeSearch(this.store);

  private readonly metrics = new KnowledgeMetrics();

  /** Cria um novo KnowledgeDocument — `version` inicia em 1. */
  createDocument(input: KnowledgeDocumentInput): KnowledgeDocument {
    const now = new Date();

    const document: KnowledgeDocument = {
      id: crypto.randomUUID(),
      title: input.title,
      content: input.content,
      summary: input.summary,
      category: input.category,
      tags: input.tags,
      metadata: input.metadata,
      status: input.status,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.store.add(document);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.KNOWLEDGE_CREATED,
      source: "KnowledgeManager",
      payload: { id: document.id, category: document.category, title: document.title },
      createdAt: now,
    });

    return document;
  }

  /**
   * Atualiza os campos de `input` (parcial) no KnowledgeDocument de
   * `id`, incrementando `version` e `updatedAt`. Retorna `undefined` se
   * o documento não existir.
   */
  updateDocument(id: string, input: Partial<KnowledgeDocumentInput>): KnowledgeDocument | undefined {
    const existing = this.knowledgeSearch.byId(id);

    if (!existing) {
      return undefined;
    }

    const updated: KnowledgeDocument = {
      ...existing,
      ...input,
      version: existing.version + 1,
      updatedAt: new Date(),
    };

    this.store.add(updated);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.KNOWLEDGE_UPDATED,
      source: "KnowledgeManager",
      payload: { id: updated.id, version: updated.version },
      createdAt: updated.updatedAt,
    });

    return updated;
  }

  /** Remove o KnowledgeDocument de `id`. Retorna `false` se não existir. */
  removeDocument(id: string): boolean {
    const removed = this.store.remove(id);

    if (removed) {
      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.KNOWLEDGE_REMOVED,
        source: "KnowledgeManager",
        payload: { id },
        createdAt: new Date(),
      });
    }

    return removed;
  }

  /** Retorna o KnowledgeDocument de `id`, ou `undefined` se não existir. Registra consulta e emite KNOWLEDGE_ACCESSED. */
  getDocument(id: string): KnowledgeDocument | undefined {
    const startedAt = Date.now();
    const document = this.knowledgeSearch.byId(id);

    this.recordAccess(startedAt, { id, found: Boolean(document) });

    return document;
  }

  /** Retorna todos os KnowledgeDocument. Registra consulta e emite KNOWLEDGE_ACCESSED. */
  list(): KnowledgeDocument[] {
    const startedAt = Date.now();
    const documents = this.knowledgeSearch.all();

    this.recordAccess(startedAt, { count: documents.length });

    return documents;
  }

  /** Pesquisa textual livre em título e conteúdo. Registra consulta e emite KNOWLEDGE_SEARCHED. */
  search(query: string): KnowledgeDocument[] {
    const startedAt = Date.now();
    const results = this.knowledgeSearch.byText(query);
    const durationMs = Date.now() - startedAt;

    this.metrics.recordSearch(durationMs);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.KNOWLEDGE_SEARCHED,
      source: "KnowledgeManager",
      payload: { query, count: results.length, durationMs },
      createdAt: new Date(),
    });

    return results;
  }

  /** Retrato agregado de métricas — quantidade de documentos, consultas, tempo médio, e distribuição por categoria. */
  getMetrics(): KnowledgeMetricsSnapshot {
    return this.metrics.snapshot(this.store.getAll());
  }

  private recordAccess(startedAt: number, payload: Record<string, unknown>): void {
    const durationMs = Date.now() - startedAt;

    this.metrics.recordSearch(durationMs);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.KNOWLEDGE_ACCESSED,
      source: "KnowledgeManager",
      payload: { ...payload, durationMs },
      createdAt: new Date(),
    });
  }
}
