import type { Metric } from "./Metric.js";

/**
 * Metric Repository — Metric é sempre um fato imutável (uma observação em um instante); nunca há
 * `update` nem `remove`, mesma disciplina já aplicada a Ledger Entry (`FINANCE_HUB`, IMP-007).
 */
export interface MetricRepository {
  create(metric: Metric): Promise<Metric>;
  listByName(name: string): Promise<readonly Metric[]>;
}
