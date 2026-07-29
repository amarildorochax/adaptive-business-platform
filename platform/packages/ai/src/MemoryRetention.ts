/**
 * Memory Retention — o prazo mínimo de retenção aplicável a uma combinação de Escopo e Tipo, política
 * gerenciada centralmente, nunca decidida individualmente por um consumidor.
 * Estrutura definida em MEMORY_CONCRETE_STRUCTURE.md.
 */
import type { MemoryScope } from "./MemoryScope.js";
import type { MemoryType } from "./MemoryType.js";

export interface MemoryRetention {
  /** Escopo ao qual esta política se aplica. */
  readonly scope: MemoryScope;

  /** Tipo ao qual esta política se aplica. */
  readonly type: MemoryType;

  /** Prazo mínimo de retenção, em dias. */
  readonly minimumRetentionDays: number;
}
