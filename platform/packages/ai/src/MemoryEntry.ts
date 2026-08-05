/**
 * Memory Entry — uma entrada de memória, combinando Tipo, Escopo e Titularidade em um compartimento
 * distinto, nunca uma estrutura de armazenamento paralela e potencialmente divergente da verdade já
 * consolidada por cada Business Hub proprietário.
 * Estrutura, regras e invariantes definidas em MEMORY_CONCRETE_STRUCTURE.md.
 */
import type { MemoryType } from "./MemoryType.js";
import type { MemoryScope } from "./MemoryScope.js";
import type { MemoryOwnership } from "./MemoryOwnership.js";

export interface MemoryEntry {
  /** Identificador da entrada de memória. */
  readonly memoryId: string;

  /** Tenant ao qual a entrada pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** Natureza da entrada. */
  readonly type: MemoryType;

  /** Categoria de alcance da entrada. */
  readonly scope: MemoryScope;

  /** Titularidade da entrada. */
  readonly ownership: MemoryOwnership;

  /** Momento da criação. */
  readonly createdAt: Date;

  /**
   * Título legível da entrada, herdado de `src/core/memory/MemoryRecord.ts` (Business Memory
   * legado, real e funcional) — `MemoryEntry`, como já declarado, cobre apenas Tipo/Escopo/
   * Titularidade; estes três campos práticos são portados aqui pela mesma disciplina já aplicada em
   * toda Sprint anterior desta série (extensão aditiva, nunca redefinição).
   */
  readonly title?: string;

  /** Conteúdo da entrada, herdado de `MemoryRecord.content`. */
  readonly content?: string;

  /** Marcadores de categorização livre, herdados de `MemoryRecord.tags`. */
  readonly tags?: readonly string[];
}
