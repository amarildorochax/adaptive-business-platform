import type { MemoryRecord } from "./MemoryRecord";

/**
 * Contrato de persistência futura para MemoryStore (Tarefa 11 — não
 * implementado nesta Sprint).
 *
 * Responsabilidade: quando um backend de persistência real (banco de
 * dados, arquivo, ou serviço externo) for autorizado em uma Sprint
 * futura, ele deve implementar esta interface — MemoryStore então
 * passará a delegar a ela em vez de manter apenas o `Map` em memória
 * (ver MemoryStore.ts). Nenhum componente desta Sprint instancia,
 * consome, ou depende deste contrato.
 */
export interface MemoryPersistenceAdapter {
  save(record: MemoryRecord): Promise<void>;
  load(id: string): Promise<MemoryRecord | undefined>;
  loadAll(): Promise<MemoryRecord[]>;
  delete(id: string): Promise<void>;
}
