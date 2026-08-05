import type { Insight } from './Insight';

/** Contrato de persistência de Insight — apenas o contrato. Sem `update`/`remove` — Insights Never Execute (Blueprint ADR-005); um Insight é sempre um registro histórico, nunca revisado. */
export interface InsightRepository {
  create(insight: Insight): Promise<Insight>;
  get(insightId: string): Promise<Insight | undefined>;
  list(tenantId: string): Promise<Insight[]>;
}
