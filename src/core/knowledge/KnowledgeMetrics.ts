import type { KnowledgeCategory } from "./KnowledgeCategory";

/** Retrato agregado do uso do Knowledge Base, produzido sob demanda por `KnowledgeMetrics.snapshot()`. */
export interface KnowledgeMetricsSnapshot {
  documentsRegistered: number;
  documentsByCategory: Record<string, number>;
  totalQueries: number;
  averageSearchTimeMs: number;
}

/**
 * Métricas de uso do Knowledge Base (Tarefa 09/11) — mesmo padrão já
 * usado por AIMetrics/MemoryMetrics/PromptMetrics/OrchestratorMetrics/
 * WorkflowMetrics/AgentCatalogMetrics.
 *
 * Responsabilidade: registrar cada busca (`recordSearch`) feita por
 * KnowledgeManager e agregar, sob demanda, quantidade de documentos,
 * consultas, tempo médio de busca, e quantidade por categoria.
 *
 * Dependências: KnowledgeCategory (tipo, apenas para tipar o snapshot).
 */
export class KnowledgeMetrics {
  private searchDurationsMs: number[] = [];

  /** Registra a duração de uma busca (search/getDocument/list) já concluída. */
  recordSearch(durationMs: number): void {
    this.searchDurationsMs.push(durationMs);
  }

  /**
   * Monta um retrato agregado — `documentsRegistered`/
   * `documentsByCategory` a partir de `documents` (normalmente
   * `KnowledgeStore.getAll()`, passado pelo chamador para que
   * KnowledgeMetrics não dependa de KnowledgeStore).
   */
  snapshot(documents: { category: KnowledgeCategory }[]): KnowledgeMetricsSnapshot {
    const documentsByCategory: Record<string, number> = {};

    for (const document of documents) {
      documentsByCategory[document.category] = (documentsByCategory[document.category] ?? 0) + 1;
    }

    const totalQueries = this.searchDurationsMs.length;
    const averageSearchTimeMs =
      totalQueries === 0
        ? 0
        : this.searchDurationsMs.reduce((sum, ms) => sum + ms, 0) / totalQueries;

    return {
      documentsRegistered: documents.length,
      documentsByCategory,
      totalQueries,
      averageSearchTimeMs,
    };
  }

  /** Descarta o histórico de durações de busca já registradas. */
  clear(): void {
    this.searchDurationsMs = [];
  }
}
