/**
 * Connector Contract — definição formal, versionada, de formato esperado de entrada e de saída de
 * um Connector.
 * Estrutura definida em INTEGRATION_CONCRETE_STRUCTURE.md.
 */
export interface ConnectorContract {
  /** Connector ao qual este Contract se aplica. */
  readonly connectorId: string;

  /** Versão do Contract. */
  readonly contractVersion: string;
}
