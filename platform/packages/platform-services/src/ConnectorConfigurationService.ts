import type { ConnectorConfiguration } from "./ConnectorConfiguration.js";
import type { ConnectorConfigurationRepository } from "./ConnectorConfigurationRepository.js";

/**
 * Connector Configuration Service — implementa o "Configuration Manager" (`INTEGRATION_HUB.md`,
 * Capítulo 7): "administra os parâmetros específicos de cada Conexão... aplicando o princípio
 * Configuration over Code." A Configuration vigente é sempre a última em ordem de inserção — nunca
 * ordenada por nenhum campo de tempo, mesma disciplina já usada em `CredentialService.matches`
 * (IMP-011).
 */
export class ConnectorConfigurationService {
  constructor(private readonly repository: ConnectorConfigurationRepository) {}

  async configure(connectorId: string, tenantId: string, parameters: Readonly<Record<string, string>>): Promise<ConnectorConfiguration> {
    const configuration: ConnectorConfiguration = { connectorId, tenantId, parameters };
    return this.repository.create(configuration);
  }

  async current(connectorId: string, tenantId: string): Promise<ConnectorConfiguration | undefined> {
    const configurations = await this.repository.listByConnectorAndTenant(connectorId, tenantId);
    return configurations[configurations.length - 1];
  }
}
