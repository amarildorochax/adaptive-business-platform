/** Retrato agregado de uso do Prompt Manager, produzido sob demanda por `PromptMetrics.snapshot()`. */
export interface PromptMetricsSnapshot {
  promptsGenerated: number;
  averageContentLength: number;
  averageBuildTimeMs: number;
  templatesUsed: Record<string, number>;
}

/**
 * Métricas de uso do Prompt Manager (Tarefa 07) — mesmo padrão já
 * usado por AIMetrics/MemoryMetrics.
 *
 * Responsabilidade: registrar cada prompt gerado por PromptManager —
 * tamanho do conteúdo final, tempo de montagem, e qual template (se
 * algum) foi usado — e agregar sob demanda.
 *
 * Dependências: nenhuma.
 */
export class PromptMetrics {
  private contentLengths: number[] = [];

  private buildDurationsMs: number[] = [];

  private templateUsageCount = new Map<string, number>();

  /**
   * Registra a geração de um prompt.
   * @param contentLength - comprimento (em caracteres) do prompt final montado.
   * @param buildTimeMs - tempo gasto por PromptBuilder para montá-lo.
   * @param templateId - id do PromptTemplate usado, quando algum foi usado.
   */
  recordGeneration(contentLength: number, buildTimeMs: number, templateId?: string): void {
    this.contentLengths.push(contentLength);
    this.buildDurationsMs.push(buildTimeMs);

    if (templateId) {
      this.templateUsageCount.set(templateId, (this.templateUsageCount.get(templateId) ?? 0) + 1);
    }
  }

  /** Monta um retrato agregado das métricas já registradas. */
  snapshot(): PromptMetricsSnapshot {
    const promptsGenerated = this.contentLengths.length;

    const average = (values: number[]) =>
      values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

    return {
      promptsGenerated,
      averageContentLength: average(this.contentLengths),
      averageBuildTimeMs: average(this.buildDurationsMs),
      templatesUsed: Object.fromEntries(this.templateUsageCount),
    };
  }

  /** Descarta todo o histórico já registrado. */
  clear(): void {
    this.contentLengths = [];
    this.buildDurationsMs = [];
    this.templateUsageCount.clear();
  }
}
