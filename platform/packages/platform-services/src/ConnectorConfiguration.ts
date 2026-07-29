/**
 * Connector Configuration — parâmetros específicos de uma instância de Connector para um Tenant
 * específico, aplicando o princípio Configuration over Code.
 * Estrutura, regras e invariantes definidas em INTEGRATION_CONCRETE_STRUCTURE.md.
 */
export interface ConnectorConfiguration {
  /** Connector ao qual esta Configuration se aplica. */
  readonly connectorId: string;

  /** Tenant ao qual esta Configuration pertence. */
  readonly tenantId: string;

  /** Parâmetros específicos desta instância. */
  readonly parameters: Readonly<Record<string, string>>;
}
