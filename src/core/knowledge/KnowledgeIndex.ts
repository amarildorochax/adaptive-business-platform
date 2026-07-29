import type { KnowledgeDocument } from "./KnowledgeDocument";
import type { KnowledgeCategory } from "./KnowledgeCategory";
import type { KnowledgeStatus } from "./KnowledgeStatus";

/**
 * Pesquisa sobre uma coleção de KnowledgeDocument já carregada — por
 * id, categoria, tags, título, conteúdo, ou status (Tarefa 06/07) —
 * mesmo padrão já usado por `MemoryIndex` (`@/core/memory`, inalterada).
 *
 * Responsabilidade: toda a lógica de filtro/busca de baixo nível vive
 * exclusivamente aqui — apenas KnowledgeSearch a consome; KnowledgeStore
 * nunca filtra, e KnowledgeManager/KnowledgeBase nunca acessam este
 * índice diretamente (ver KnowledgeSearch.ts).
 *
 * Nota (busca semântica futura): `byContent()`/`byText()` são busca
 * textual ingênua (substring, case-insensitive) — não é busca
 * semântica. Quando embeddings forem implementados (ver
 * KnowledgeEmbedding.ts, Tarefa 11/12), um método `bySemanticQuery()`
 * pode ser adicionado aqui sem alterar nenhum método já existente —
 * mesmo princípio já reservado por `MemoryIndex`.
 *
 * Dependências: KnowledgeDocument, KnowledgeCategory, KnowledgeStatus
 * (tipos).
 *
 * Instanciado sem estado próprio — cada método recebe a lista de
 * documentos já carregada de KnowledgeStore.
 */
export class KnowledgeIndex {
  /** Documento cujo `id` é exatamente `id`, ou `undefined`. */
  byId(documents: KnowledgeDocument[], id: string): KnowledgeDocument | undefined {
    return documents.find((document) => document.id === id);
  }

  /** Documentos cuja `category` é exatamente `category`. */
  byCategory(documents: KnowledgeDocument[], category: KnowledgeCategory): KnowledgeDocument[] {
    return documents.filter((document) => document.category === category);
  }

  /** Documentos que possuem pelo menos uma das `tags` informadas. */
  byTags(documents: KnowledgeDocument[], tags: string[]): KnowledgeDocument[] {
    if (tags.length === 0) {
      return [];
    }

    return documents.filter((document) => document.tags.some((tag) => tags.includes(tag)));
  }

  /** Documentos cujo `title` contém `query` (case-insensitive). */
  byTitle(documents: KnowledgeDocument[], query: string): KnowledgeDocument[] {
    const normalized = query.trim().toLowerCase();

    if (normalized.length === 0) {
      return [];
    }

    return documents.filter((document) => document.title.toLowerCase().includes(normalized));
  }

  /** Documentos cujo `content` contém `query` (case-insensitive) — busca textual ingênua, nunca semântica. */
  byContent(documents: KnowledgeDocument[], query: string): KnowledgeDocument[] {
    const normalized = query.trim().toLowerCase();

    if (normalized.length === 0) {
      return [];
    }

    return documents.filter((document) => document.content.toLowerCase().includes(normalized));
  }

  /** Documentos cujo `status` é exatamente `status`. */
  byStatus(documents: KnowledgeDocument[], status: KnowledgeStatus): KnowledgeDocument[] {
    return documents.filter((document) => document.status === status);
  }

  /** Documentos cujo `title` ou `content` contém `query` (case-insensitive) — busca textual ingênua, nunca semântica. */
  byText(documents: KnowledgeDocument[], query: string): KnowledgeDocument[] {
    const normalized = query.trim().toLowerCase();

    if (normalized.length === 0) {
      return [];
    }

    return documents.filter(
      (document) =>
        document.title.toLowerCase().includes(normalized) ||
        document.content.toLowerCase().includes(normalized)
    );
  }
}
