/**
 * Memory Scope — as cinco categorias de alcance de memória, da mais estreita (Efêmera) à mais ampla
 * (Organizacional).
 * Estrutura definida em MEMORY_CONCRETE_STRUCTURE.md.
 */
export type MemoryScope =
  | "Efêmera"
  | "Persistente"
  | "Compartilhada"
  | "Contextual"
  | "Organizacional";
