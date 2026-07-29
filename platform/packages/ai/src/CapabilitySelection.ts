/**
 * Capability Selection — o conjunto de Capabilities já registradas que respondem a uma solicitação;
 * nenhuma Capability é inventada no momento da solicitação.
 * Estrutura definida em ORCHESTRATOR_CONCRETE_STRUCTURE.md.
 */
export interface CapabilitySelection {
  /** Solicitação para a qual esta seleção foi feita. */
  readonly requestId: string;

  /** Identificadores das Capabilities já selecionadas. */
  readonly capabilityIds: readonly string[];

  /** Momento da resolução. */
  readonly resolvedAt: Date;
}
