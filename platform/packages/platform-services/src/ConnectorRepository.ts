import type { Connector } from "./Connector.js";

/**
 * Connector Repository — "Connector Registry é a fonte oficial de todo Connector disponível na
 * plataforma. Nenhuma implementação de integração é considerada válida sem registro formal" (ADR-004).
 * Um Connector registrado nunca é removido do catálogo, apenas depreciado por nova versão
 * (Connector Lifecycle Manager, médio prazo — ver relatório) — sem `update` nem `remove` no Core.
 */
export interface ConnectorRepository {
  create(connector: Connector): Promise<Connector>;
  find(connectorId: string): Promise<Connector | undefined>;
  list(): Promise<readonly Connector[]>;
}
