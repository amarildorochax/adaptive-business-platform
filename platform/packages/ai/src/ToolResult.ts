/**
 * Tool Result — o formato esperado do resultado de uma Ferramenta.
 * Estrutura definida em TOOL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface ToolResult {
  /** Ferramenta à qual este formato de resultado se aplica. */
  readonly toolId: string;

  /** Descrição do formato esperado do resultado. */
  readonly resultFormat: string;
}
