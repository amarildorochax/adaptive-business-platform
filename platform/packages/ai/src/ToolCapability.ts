/**
 * Tool Capability — as Capabilities às quais uma Ferramenta é relevante, consumida através da cadeia
 * Agente → Skill → Tool Abstraction → recurso externo.
 * Estrutura definida em TOOL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface ToolCapability {
  /** Ferramenta associada. */
  readonly toolId: string;

  /** Capabilities às quais esta Ferramenta é relevante. */
  readonly capabilityIds: readonly string[];
}
