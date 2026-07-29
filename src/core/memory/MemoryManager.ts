import type { MemoryRecord } from "./MemoryRecord";
import type { MemoryCategory } from "./MemoryCategory";
import { MemoryStore } from "./MemoryStore";
import { MemoryIndex } from "./MemoryIndex";
import { MemoryMetrics } from "./MemoryMetrics";
import { eventBus } from "../events/EventBus";
import { EventTypes } from "../events/EventTypes";

/** Campos aceitos por `MemoryManager.create()` — os cinco campos que o chamador de fato decide. */
export type MemoryRecordInput = Pick<MemoryRecord, "category" | "title" | "content" | "tags" | "metadata">;

/**
 * CRUD, versionamento, e organização de MemoryRecord (Tarefa 02).
 *
 * Responsabilidade: único componente que escreve em MemoryStore ou lê
 * através de MemoryIndex — é aqui, e somente aqui, que `version` é
 * incrementado, que `MEMORY_CREATED/UPDATED/REMOVED/ACCESSED` são
 * emitidos no EventBus, e que a duração de cada consulta é registrada
 * em MemoryMetrics.
 *
 * "Expiração futura" (Tarefa 02): `MemoryRecord.expiresAt` já existe
 * como campo, mas nenhum método deste Manager o lê ou aplica — reserva
 * para uma Sprint futura.
 *
 * Dependências: MemoryStore, MemoryIndex, MemoryMetrics, EventBus/
 * EventTypes.
 *
 * Consumido exclusivamente por BusinessMemory — nenhum outro componente
 * deve manter sua própria instância de MemoryManager.
 */
export class MemoryManager {
  private readonly store = new MemoryStore();

  private readonly index = new MemoryIndex();

  private readonly metrics = new MemoryMetrics();

  /** Cria um novo MemoryRecord — `version` inicia em 1. */
  create(input: MemoryRecordInput): MemoryRecord {
    const now = new Date();

    const record: MemoryRecord = {
      id: crypto.randomUUID(),
      category: input.category,
      title: input.title,
      content: input.content,
      tags: input.tags,
      metadata: input.metadata,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.store.add(record);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.MEMORY_CREATED,
      source: "MemoryManager",
      payload: { id: record.id, category: record.category, title: record.title },
      createdAt: now,
    });

    return record;
  }

  /** Retorna o MemoryRecord de `id`, ou `undefined` se não existir. Registra consulta e emite MEMORY_ACCESSED. */
  get(id: string): MemoryRecord | undefined {
    const startedAt = Date.now();
    const record = this.store.get(id);

    this.recordAccess(startedAt, { id, found: Boolean(record) });

    return record;
  }

  /**
   * Atualiza os campos de `input` (parcial) no MemoryRecord de `id`,
   * incrementando `version` e `updatedAt`. Retorna `undefined` se o
   * registro não existir.
   */
  update(id: string, input: Partial<MemoryRecordInput>): MemoryRecord | undefined {
    const existing = this.store.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: MemoryRecord = {
      ...existing,
      ...input,
      version: existing.version + 1,
      updatedAt: new Date(),
    };

    this.store.add(updated);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.MEMORY_UPDATED,
      source: "MemoryManager",
      payload: { id: updated.id, version: updated.version },
      createdAt: updated.updatedAt,
    });

    return updated;
  }

  /** Remove o MemoryRecord de `id`. Retorna `false` se não existir. */
  remove(id: string): boolean {
    const removed = this.store.remove(id);

    if (removed) {
      eventBus.emit({
        id: crypto.randomUUID(),
        type: EventTypes.MEMORY_REMOVED,
        source: "MemoryManager",
        payload: { id },
        createdAt: new Date(),
      });
    }

    return removed;
  }

  /** Retorna todos os MemoryRecord. Registra consulta e emite MEMORY_ACCESSED. */
  getAll(): MemoryRecord[] {
    const startedAt = Date.now();
    const records = this.store.getAll();

    this.recordAccess(startedAt, { count: records.length });

    return records;
  }

  /** Pesquisa por categoria (Tarefa 05/07). Registra consulta e emite MEMORY_ACCESSED. */
  searchByCategory(category: MemoryCategory): MemoryRecord[] {
    const startedAt = Date.now();
    const results = this.index.byCategory(this.store.getAll(), category);

    this.recordAccess(startedAt, { category, count: results.length });

    return results;
  }

  /** Pesquisa por tags (ao menos uma correspondência). Registra consulta e emite MEMORY_ACCESSED. */
  searchByTags(tags: string[]): MemoryRecord[] {
    const startedAt = Date.now();
    const results = this.index.byTags(this.store.getAll(), tags);

    this.recordAccess(startedAt, { tags, count: results.length });

    return results;
  }

  /** Pesquisa textual livre em título e conteúdo. Registra consulta e emite MEMORY_ACCESSED. */
  searchByText(query: string): MemoryRecord[] {
    const startedAt = Date.now();
    const results = this.index.byText(this.store.getAll(), query);

    this.recordAccess(startedAt, { query, count: results.length });

    return results;
  }

  /** Retrato agregado de métricas — quantidade de memórias, consultas, tempo médio, e distribuição por categoria. */
  getMetrics() {
    return this.metrics.snapshot(this.store.getAll());
  }

  private recordAccess(startedAt: number, payload: Record<string, unknown>): void {
    const durationMs = Date.now() - startedAt;

    this.metrics.recordQuery(durationMs);

    eventBus.emit({
      id: crypto.randomUUID(),
      type: EventTypes.MEMORY_ACCESSED,
      source: "MemoryManager",
      payload: { ...payload, durationMs },
      createdAt: new Date(),
    });
  }
}
