import type { MemoryCategory } from "./MemoryCategory";

/** Retrato agregado do estado e do uso do Business Memory, produzido sob demanda por `MemoryMetrics.snapshot()`. */
export interface MemoryMetricsSnapshot {
  totalRecords: number;
  recordsByCategory: Record<string, number>;
  totalQueries: number;
  averageQueryTimeMs: number;
}

/**
 * Métricas de uso do Business Memory (Tarefa 09) — mesmo padrão já
 * usado por AIMetrics/ExecutionHistory.
 *
 * Responsabilidade: registrar cada consulta (`recordQuery`) feita por
 * MemoryManager e agregar, sob demanda, quantidade de memórias,
 * consultas, tempo médio de consulta, e quantidade por categoria.
 *
 * Dependências: MemoryCategory (tipo, apenas para tipar o snapshot).
 */
export class MemoryMetrics {
  private queryDurationsMs: number[] = [];

  /** Registra a duração de uma consulta (get/search) já concluída. */
  recordQuery(durationMs: number): void {
    this.queryDurationsMs.push(durationMs);
  }

  /**
   * Monta um retrato agregado — `totalRecords`/`recordsByCategory` a
   * partir de `records` (normalmente `MemoryStore.getAll()`, passado
   * pelo chamador para que MemoryMetrics não dependa de MemoryStore).
   */
  snapshot(records: { category: MemoryCategory }[]): MemoryMetricsSnapshot {
    const recordsByCategory: Record<string, number> = {};

    for (const record of records) {
      recordsByCategory[record.category] = (recordsByCategory[record.category] ?? 0) + 1;
    }

    const totalQueries = this.queryDurationsMs.length;
    const averageQueryTimeMs =
      totalQueries === 0
        ? 0
        : this.queryDurationsMs.reduce((sum, ms) => sum + ms, 0) / totalQueries;

    return {
      totalRecords: records.length,
      recordsByCategory,
      totalQueries,
      averageQueryTimeMs,
    };
  }

  /** Descarta o histórico de durações de consulta já registradas. */
  clear(): void {
    this.queryDurationsMs = [];
  }
}
