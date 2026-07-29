/**
 * Tool Constraint — uma restrição arquitetural aplicável a uma Ferramenta, incluindo a garantia de
 * Isolamento tecnológico — propriedade central da Tool Abstraction.
 * Estrutura definida em TOOL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface ToolConstraint {
  /** Ferramenta à qual esta restrição se aplica. */
  readonly toolId: string;

  /** Descrição da restrição arquitetural. */
  readonly description: string;
}
