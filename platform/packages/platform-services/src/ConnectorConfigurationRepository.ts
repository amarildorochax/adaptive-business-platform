import type { ConnectorConfiguration } from "./ConnectorConfiguration.js";

/**
 * Connector Configuration Repository — cada reconfiguração é um novo registro imutável, nunca uma
 * sobrescrita — mesma disciplina de "nenhuma atualização de conhecimento sobrescreve silenciosamente
 * o que existia antes" (ADR-005, aplicada aqui a Configuration) já usada em `KnowledgeVersionRepository`
 * (IMP-015); a Configuration vigente é sempre a última em ordem de inserção.
 */
export interface ConnectorConfigurationRepository {
  create(configuration: ConnectorConfiguration): Promise<ConnectorConfiguration>;
  listByConnectorAndTenant(connectorId: string, tenantId: string): Promise<readonly ConnectorConfiguration[]>;
}
