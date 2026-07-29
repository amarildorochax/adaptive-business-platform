/**
 * Tool Definition — a definição de uma Ferramenta e sua categoria de mediação, sempre um contrato
 * estável e abstrato, nunca uma implementação técnica direta.
 * Estrutura definida em TOOL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export type ToolCategory = "Integration" | "Knowledge" | "Query" | "ExternalResource";

export interface ToolDefinition {
  /** Ferramenta definida. */
  readonly toolId: string;

  /** Categoria de mediação desta Ferramenta. */
  readonly category: ToolCategory;
}
