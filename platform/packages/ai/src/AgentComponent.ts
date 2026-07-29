/**
 * Agent Component — os sete componentes internos próprios de todo Agente. Context e Memory operam
 * como entradas consumidas de componentes já implementados (Context, Memory), não como componentes
 * internos contados entre os sete.
 * Estrutura definida em AGENT_FRAMEWORK_CONCRETE_STRUCTURE.md.
 */
export type AgentComponent =
  | "Identity"
  | "Reasoning Engine"
  | "Planning Component"
  | "Capability Consumer"
  | "Skill Invocation"
  | "Tool Adapter"
  | "Structured Response";
