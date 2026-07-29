import type { KnowledgeDocument } from "./KnowledgeDocument";
import type { KnowledgeCategory } from "./KnowledgeCategory";
import type { KnowledgeStatus } from "./KnowledgeStatus";
import type { KnowledgeStore } from "./KnowledgeStore";
import { KnowledgeIndex } from "./KnowledgeIndex";

/**
 * Centraliza toda pesquisa sobre KnowledgeDocument (Tarefa 07/08).
 *
 * Responsabilidade: único componente que lê de KnowledgeStore para fins
 * de consulta — `KnowledgeManager`/`KnowledgeBase` nunca chamam
 * `KnowledgeStore.getAll()`/`KnowledgeStore.get()` diretamente para
 * pesquisa (apenas para escrita, dentro de KnowledgeManager); "toda
 * consulta deve passar por KnowledgeSearch", incluindo a busca por
 * `id` (`byId`), listagem completa (`all`), e todo filtro (categoria/
 * tags/título/conteúdo/status/texto livre).
 *
 * Dependências: KnowledgeStore (leitura, injetado pelo construtor),
 * KnowledgeIndex (lógica de filtro).
 *
 * Consumido exclusivamente por KnowledgeManager.
 */
export class KnowledgeSearch {
  private readonly index = new KnowledgeIndex();

  constructor(private readonly store: KnowledgeStore) {}

  /** Retorna todos os documentos — mesmo dado de `KnowledgeStore.getAll()`, mas sempre através desta camada. */
  all(): KnowledgeDocument[] {
    return this.store.getAll();
  }

  /** Localiza um documento por `id`. */
  byId(id: string): KnowledgeDocument | undefined {
    return this.index.byId(this.store.getAll(), id);
  }

  /** Pesquisa por categoria. */
  byCategory(category: KnowledgeCategory): KnowledgeDocument[] {
    return this.index.byCategory(this.store.getAll(), category);
  }

  /** Pesquisa por tags (ao menos uma correspondência). */
  byTags(tags: string[]): KnowledgeDocument[] {
    return this.index.byTags(this.store.getAll(), tags);
  }

  /** Pesquisa por título. */
  byTitle(query: string): KnowledgeDocument[] {
    return this.index.byTitle(this.store.getAll(), query);
  }

  /** Pesquisa por conteúdo. */
  byContent(query: string): KnowledgeDocument[] {
    return this.index.byContent(this.store.getAll(), query);
  }

  /** Pesquisa por status. */
  byStatus(status: KnowledgeStatus): KnowledgeDocument[] {
    return this.index.byStatus(this.store.getAll(), status);
  }

  /** Pesquisa textual livre em título e conteúdo — usada por `KnowledgeBase.search()`. */
  byText(query: string): KnowledgeDocument[] {
    return this.index.byText(this.store.getAll(), query);
  }
}
