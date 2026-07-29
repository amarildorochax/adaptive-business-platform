import type { AITokenUsage } from "./AITokenUsage";

/** Registro de uma única chamada a `AIGateway.generate()`, sucesso ou falha. */
export interface AIMetricRecord {
  id: string;
  provider: string;
  success: boolean;
  latencyMs: number;
  tokenUsage?: AITokenUsage;
  errorCode?: string;
  recordedAt: Date;
}

/**
 * Histórico em memória de chamadas à camada de IA — mesmo padrão já
 * usado por ExecutionHistory (src/core/history/ExecutionHistory.ts)
 * (Tarefa 09 — Métricas).
 *
 * Responsabilidade: registrar provider utilizado, tempo de resposta,
 * sucesso/falha, e tokens (quando disponíveis) — alimentado
 * exclusivamente por AIGateway. Complementar, nunca duplicado, à
 * emissão de eventos `AI_REQUEST_*` no EventBus — AIMetrics é a
 * consulta local e agregável; o EventBus é a notificação em tempo real.
 *
 * Dependências: AITokenUsage (tipo).
 */
export class AIMetrics {
  private records: AIMetricRecord[] = [];

  /** Adiciona um registro ao início do histórico (mais recente primeiro). */
  record(record: AIMetricRecord): void {
    this.records.unshift(record);
  }

  /** Retorna uma cópia rasa de todos os registros, mais recente primeiro. */
  getAll(): AIMetricRecord[] {
    return [...this.records];
  }

  /** Retorna apenas os registros do provider `providerId`. */
  getByProvider(providerId: string): AIMetricRecord[] {
    return this.records.filter((record) => record.provider === providerId);
  }

  /** Remove todos os registros do histórico. */
  clear(): void {
    this.records = [];
  }

  /** Quantidade total de registros no histórico. */
  count(): number {
    return this.records.length;
  }
}

/** Instância única e compartilhada do AIMetrics para toda a plataforma. */
export const aiMetrics = new AIMetrics();
