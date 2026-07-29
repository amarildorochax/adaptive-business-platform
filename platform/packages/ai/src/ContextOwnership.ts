/**
 * Context Ownership — matriz de categorias de Contexto e seus proprietários oficiais, extensão direta
 * de DOMAIN_OWNERSHIP_MATRIX.md.
 * Estrutura definida em CONTEXT_CONCRETE_STRUCTURE.md.
 */
export type ContextCategory =
  | "Customer Context"
  | "Financial Context"
  | "Campaign Context"
  | "Metrics Context"
  | "Knowledge Context"
  | "Identity Context"
  | "Communication Context"
  | "Automation Context";

export interface ContextOwnership {
  /** Categoria de Contexto. */
  readonly category: ContextCategory;

  /** Módulo proprietário oficial desta categoria. */
  readonly owner: string;
}
