/**
 * Tool Parameter — um parâmetro do contrato estável de uma Ferramenta, consumido por uma Skill sem
 * conhecimento da implementação técnica específica por trás dele.
 * Estrutura definida em TOOL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface ToolParameter {
  /** Ferramenta à qual este parâmetro pertence. */
  readonly toolId: string;

  /** Nome do parâmetro. */
  readonly parameterName: string;

  /** Se o parâmetro é obrigatório. */
  readonly required: boolean;
}
