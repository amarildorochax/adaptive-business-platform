import type { MemoryRecord } from "./MemoryRecord";

/**
 * Armazenamento de MemoryRecord — implementação inicial exclusivamente
 * em memória (`Map`), indexado por `id` (Tarefa 03).
 *
 * Responsabilidade: guardar e recuperar MemoryRecord por identificador
 * — nenhuma lógica de busca por categoria/tags/texto vive aqui (isso é
 * responsabilidade de MemoryIndex, que opera sobre `getAll()`), e
 * nenhuma lógica de versionamento ou de emissão de evento (isso é
 * responsabilidade de MemoryManager).
 *
 * Nenhum banco de dados é usado. `MemoryPersistenceAdapter.ts` já
 * reserva o contrato para um backend real futuro — este Store nunca o
 * referencia nesta Sprint.
 *
 * Consumido exclusivamente por MemoryManager — nenhum outro componente
 * deve manter sua própria instância de MemoryStore.
 *
 * Dependências: MemoryRecord (tipo).
 */
export class MemoryStore {
  private records = new Map<string, MemoryRecord>();

  /** Adiciona (ou substitui, se já existir o mesmo `id`) um MemoryRecord. */
  add(record: MemoryRecord): void {
    this.records.set(record.id, record);
  }

  /** Retorna o MemoryRecord de `id`, ou `undefined` se não existir. */
  get(id: string): MemoryRecord | undefined {
    return this.records.get(id);
  }

  /** Retorna todos os MemoryRecord já armazenados. */
  getAll(): MemoryRecord[] {
    return Array.from(this.records.values());
  }

  /** Remove o MemoryRecord de `id`. Retorna `false` se não existir. */
  remove(id: string): boolean {
    return this.records.delete(id);
  }

  /** Remove todos os MemoryRecord. */
  clear(): void {
    this.records.clear();
  }

  /** Quantidade total de MemoryRecord armazenados. */
  count(): number {
    return this.records.size;
  }
}
