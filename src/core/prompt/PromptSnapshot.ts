import type { PromptRecord } from "./PromptRecord";

/**
 * Contrato de snapshot/histórico de versões de um PromptRecord (Tarefa
 * 11 — não implementado nesta Sprint). Mesmo papel que MemorySnapshot.ts
 * cumpre para MemoryRecord.
 *
 * PromptRegistry hoje apenas incrementa `PromptRecord.version` — nenhum
 * componente desta Sprint cria, armazena, ou consulta um PromptSnapshot.
 */
export interface PromptSnapshot {
  recordId: string;
  version: number;
  record: PromptRecord;
  snapshotAt: Date;
}
