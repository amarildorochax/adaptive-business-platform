/**
 * Tool Requirement — o escopo de Permission exigido para acesso a uma Ferramenta, sempre herdado da
 * solicitação original, nunca ampliado pelo Agente ou pela Skill que a invoca.
 * Estrutura definida em TOOL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface ToolRequirement {
  /** Ferramenta à qual este requisito se aplica. */
  readonly toolId: string;

  /** Escopo de Permission exigido, herdado da solicitação original. */
  readonly permissionScope: readonly string[];
}
