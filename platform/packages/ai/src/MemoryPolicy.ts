/**
 * Memory Policy — se uma combinação de Escopo e Tipo é legível e/ou gravável; Escrita é sempre mais
 * restrita que Leitura.
 * Estrutura definida em MEMORY_CONCRETE_STRUCTURE.md.
 */
import type { MemoryScope } from "./MemoryScope.js";
import type { MemoryType } from "./MemoryType.js";

export interface MemoryPolicy {
  /** Escopo ao qual esta política se aplica. */
  readonly scope: MemoryScope;

  /** Tipo ao qual esta política se aplica. */
  readonly type: MemoryType;

  /** Se este compartimento é legível. */
  readonly readable: boolean;

  /** Se este compartimento é gravável. */
  readonly writable: boolean;
}
