import type { KnowledgeDocument } from "./KnowledgeDocument";

/**
 * Armazenamento de KnowledgeDocument — implementação inicial
 * exclusivamente em memória (`Map`), indexado por `id` (Tarefa
 * 05/06) — mesmo padrão já usado por `MemoryStore`
 * (`@/core/memory`, inalterada).
 *
 * Responsabilidade: guardar e recuperar KnowledgeDocument por
 * identificador — nenhuma lógica de busca por categoria/tags/texto vive
 * aqui (isso é responsabilidade de KnowledgeIndex, via KnowledgeSearch),
 * e nenhuma lógica de versionamento ou de emissão de evento (isso é
 * responsabilidade de KnowledgeManager).
 *
 * Nenhum banco de dados é usado. `KnowledgePersistenceAdapter.ts`
 * (Tarefa 11/12) já reserva o contrato para um backend real futuro —
 * este Store nunca o referencia nesta Sprint.
 *
 * Consumido exclusivamente por KnowledgeManager (para escrita) e por
 * KnowledgeSearch (para leitura) — nenhum outro componente deve manter
 * sua própria instância de KnowledgeStore.
 *
 * Dependências: KnowledgeDocument (tipo).
 */
export class KnowledgeStore {
  private documents = new Map<string, KnowledgeDocument>();

  /** Adiciona (ou substitui, se já existir o mesmo `id`) um KnowledgeDocument. */
  add(document: KnowledgeDocument): void {
    this.documents.set(document.id, document);
  }

  /** Retorna o KnowledgeDocument de `id`, ou `undefined` se não existir. */
  get(id: string): KnowledgeDocument | undefined {
    return this.documents.get(id);
  }

  /** Retorna todos os KnowledgeDocument já armazenados. */
  getAll(): KnowledgeDocument[] {
    return Array.from(this.documents.values());
  }

  /** Remove o KnowledgeDocument de `id`. Retorna `false` se não existir. */
  remove(id: string): boolean {
    return this.documents.delete(id);
  }

  /** Remove todos os KnowledgeDocument. */
  clear(): void {
    this.documents.clear();
  }

  /** Quantidade total de KnowledgeDocument armazenados. */
  count(): number {
    return this.documents.size;
  }
}
