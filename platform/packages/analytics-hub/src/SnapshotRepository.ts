import type { Snapshot } from './Snapshot';

/** Contrato de persistência de Snapshot — apenas o contrato. Nunca declara `update`/`remove` — Snapshots Are Immutable (Blueprint ADR-011), enforçado estruturalmente. */
export interface SnapshotRepository {
  create(snapshot: Snapshot): Promise<Snapshot>;
  listByIndicator(indicatorId: string): Promise<Snapshot[]>;
}
