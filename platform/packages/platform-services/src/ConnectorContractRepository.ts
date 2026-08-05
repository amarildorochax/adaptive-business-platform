import type { ConnectorContract } from "./ConnectorContract.js";

/** Connector Contract Repository — "Versionamento é obrigatório para todo Connector e todo Contract" (ADR-005); cada versão é um fato imutável, nunca `update` nem `remove`. */
export interface ConnectorContractRepository {
  create(contract: ConnectorContract): Promise<ConnectorContract>;
  listByConnectorId(connectorId: string): Promise<readonly ConnectorContract[]>;
}
