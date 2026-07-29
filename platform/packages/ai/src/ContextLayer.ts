/**
 * Context Layer — as nove camadas hierárquicas de escopo de Contexto, da mais ampla à mais estreita.
 * Estrutura definida em CONTEXT_CONCRETE_STRUCTURE.md.
 */
export type ContextLayer =
  | "Global"
  | "Organization"
  | "Business"
  | "Tenant"
  | "User"
  | "Session"
  | "Conversation"
  | "Task"
  | "Execution";
