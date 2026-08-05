import type { ConnectorContract } from "./ConnectorContract.js";
import type { ConnectorContractRepository } from "./ConnectorContractRepository.js";

/**
 * Connector Contract Service — administra o "Contract" (`INTEGRATION_HUB.md`, Capítulo 8): "a
 * definição formal de formato esperado de entrada e de saída de um Connector." Cada Contract
 * registrado é uma versão preservável — "Versionamento é obrigatório para todo Connector e todo
 * Contract" (ADR-005).
 */
export class ConnectorContractService {
  constructor(private readonly repository: ConnectorContractRepository) {}

  async register(connectorId: string, contractVersion: string): Promise<ConnectorContract> {
    const contract: ConnectorContract = { connectorId, contractVersion };
    return this.repository.create(contract);
  }

  async currentVersion(connectorId: string): Promise<string | undefined> {
    const contracts = await this.repository.listByConnectorId(connectorId);
    return contracts[contracts.length - 1]?.contractVersion;
  }
}
