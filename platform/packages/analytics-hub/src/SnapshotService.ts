import type { Snapshot } from './Snapshot';
import type { SnapshotRepository } from './SnapshotRepository';

/**
 * SnapshotService — granularidade distinta de `src/core/analytics/AnalyticsSnapshot.ts` (legado
 * agrupa todas as AnalyticsMetric já coletadas em um único retrato cumulativo; o Snapshot já aprovado
 * pelo Blueprint é o valor de um único indicador em um único ponto no tempo) — nenhum campo portado,
 * conceitos diferentes (ver relatório desta Sprint). Nunca expõe `update`/`remove` — Snapshots Are
 * Immutable (Blueprint ADR-011). Nenhuma emissão de Evento aqui — responsabilidade exclusiva de
 * AnalyticsManager.
 */
export class SnapshotService {
  constructor(private readonly repository: SnapshotRepository) {}

  async record(indicatorId: string, value: number): Promise<Snapshot> {
    const snapshot: Snapshot = { snapshotId: crypto.randomUUID(), indicatorId, value, recordedAt: new Date() };
    return this.repository.create(snapshot);
  }

  async listByIndicator(indicatorId: string): Promise<readonly Snapshot[]> {
    return this.repository.listByIndicator(indicatorId);
  }
}
