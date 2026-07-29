/**
 * Tool Compatibility — as versões com as quais uma Ferramenta permanece compatível; uma mudança na
 * infraestrutura técnica é absorvida pela Tool Abstraction sem exigir alteração em nenhum Agente já
 * existente que dependa dela.
 * Estrutura definida em TOOL_RUNTIME_CONCRETE_STRUCTURE.md.
 */
export interface ToolCompatibility {
  /** Ferramenta à qual esta compatibilidade se aplica. */
  readonly toolId: string;

  /** Versões com as quais esta Ferramenta permanece compatível. */
  readonly compatibleVersions: readonly string[];
}
