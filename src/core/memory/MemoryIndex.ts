import type { MemoryRecord } from "./MemoryRecord";
import type { MemoryCategory } from "./MemoryCategory";

/**
 * Pesquisa sobre uma coleção de MemoryRecord já carregada — por
 * categoria, tags, título, ou texto livre (Tarefa 07).
 *
 * Responsabilidade: toda a lógica de filtro/busca da plataforma sobre
 * MemoryRecord vive exclusivamente aqui — MemoryManager nunca filtra
 * `MemoryStore.getAll()` manualmente.
 *
 * Nota (Tarefa 11 — busca semântica futura): `byText()` hoje é busca
 * textual ingênua (substring, case-insensitive) sobre `title`/`content`
 * — não é busca semântica. Quando embeddings forem implementados (ver
 * MemoryEmbedding.ts), um método `bySemanticQuery()` pode ser
 * adicionado aqui sem alterar nenhum dos métodos já existentes.
 *
 * Dependências: MemoryRecord, MemoryCategory (tipos).
 *
 * Instanciado sem estado próprio — cada método recebe a lista de
 * registros já carregada de MemoryStore.
 */
export class MemoryIndex {
  /** Registros cuja `category` é exatamente `category`. */
  byCategory(records: MemoryRecord[], category: MemoryCategory): MemoryRecord[] {
    return records.filter((record) => record.category === category);
  }

  /** Registros que possuem pelo menos uma das `tags` informadas. */
  byTags(records: MemoryRecord[], tags: string[]): MemoryRecord[] {
    if (tags.length === 0) {
      return [];
    }

    return records.filter((record) =>
      record.tags.some((tag) => tags.includes(tag))
    );
  }

  /** Registros cujo `title` contém `query` (case-insensitive). */
  byTitle(records: MemoryRecord[], query: string): MemoryRecord[] {
    const normalized = query.trim().toLowerCase();

    if (normalized.length === 0) {
      return [];
    }

    return records.filter((record) =>
      record.title.toLowerCase().includes(normalized)
    );
  }

  /**
   * Registros cujo `title` ou `content` contém `query`
   * (case-insensitive) — busca textual ingênua, nunca semântica.
   */
  byText(records: MemoryRecord[], query: string): MemoryRecord[] {
    const normalized = query.trim().toLowerCase();

    if (normalized.length === 0) {
      return [];
    }

    return records.filter(
      (record) =>
        record.title.toLowerCase().includes(normalized) ||
        record.content.toLowerCase().includes(normalized)
    );
  }
}
