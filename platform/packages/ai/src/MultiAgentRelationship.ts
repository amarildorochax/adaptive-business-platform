/**
 * Multi-Agent Relationship — o canal mediado através do qual os Agentes de um grupo colaboram; a
 * colaboração acontece através de exatamente três canais, e nunca por referência direta entre dois
 * Agentes.
 * Estrutura, regras e invariantes definidas em MULTI_AGENT_CONCRETE_STRUCTURE.md.
 */
export type MultiAgentRelationshipKind =
  | "MediatedByOrchestrator"
  | "SharedWorkflow"
  | "SharedRecord";

export interface MultiAgentRelationship {
  /** Grupo ao qual esta relação pertence. */
  readonly groupId: string;

  /** Agentes envolvidos na relação mediada. */
  readonly agentIds: readonly string[];

  /** Canal de colaboração através do qual esta relação é mediada. */
  readonly kind: MultiAgentRelationshipKind;
}
