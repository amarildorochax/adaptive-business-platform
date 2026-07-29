/**
 * Tool Identity — a identidade declarativa de uma Ferramenta, mediação técnica entre uma Skill e um
 * recurso externo, nunca implementada diretamente dentro de uma Skill.
 * Estrutura definida em TOOL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface ToolIdentity {
  /** Identificador da Ferramenta. */
  readonly toolId: string;

  /** Nome da Ferramenta. */
  readonly name: string;
}
