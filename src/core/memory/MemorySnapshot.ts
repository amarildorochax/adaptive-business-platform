import type { MemoryRecord } from "./MemoryRecord";

/**
 * Contrato de snapshot/histórico de versões futuro (Tarefa 11 — não
 * implementado nesta Sprint).
 *
 * Responsabilidade: reservar o formato de um retrato completo de um
 * MemoryRecord em uma versão específica — MemoryManager hoje apenas
 * incrementa `MemoryRecord.version` (ver MemoryRecord.ts), sem manter
 * nenhum histórico. Quando snapshots forem implementados, este é o
 * formato que cada entrada de histórico deve seguir. Nenhum componente
 * desta Sprint cria, armazena, ou consulta um MemorySnapshot.
 */
export interface MemorySnapshot {
  recordId: string;
  version: number;
  record: MemoryRecord;
  snapshotAt: Date;
}
