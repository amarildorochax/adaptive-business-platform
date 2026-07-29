/**
 * Tool Metadata — metadado estrutural de uma Ferramenta, sustentando a mesma disciplina de
 * rastreabilidade já aplicada aos demais componentes de AI Core.
 * Estrutura definida em TOOL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface ToolMetadata {
  /** Identificador da Ferramenta. */
  readonly toolId: string;

  /** Momento de criação da Ferramenta. */
  readonly createdAt: Date;

  /** Versão da Ferramenta. */
  readonly version: string;
}
