import type { Command, Event } from "@abp/core";
import type { Connector } from "./Connector.js";
import { ConnectorService } from "./ConnectorService.js";
import type { ConnectorConfiguration } from "./ConnectorConfiguration.js";
import { ConnectorConfigurationService } from "./ConnectorConfigurationService.js";
import type { ConnectorContract } from "./ConnectorContract.js";
import { ConnectorContractService } from "./ConnectorContractService.js";
import type { CreateConnectorPayload } from "./CreateConnectorPayload.js";
import type { RegisterWebhookPayload } from "./RegisterWebhookPayload.js";
import type { WebhookDelivery } from "./WebhookDelivery.js";
import { WebhookDeliveryService } from "./WebhookDeliveryService.js";
import type { WebhookRegistration } from "./WebhookRegistration.js";
import { WebhookRegistrationService } from "./WebhookRegistrationService.js";

export interface IntegrationManagerDependencies {
  readonly connectors: ConnectorService;
  readonly configurations: ConnectorConfigurationService;
  readonly contracts: ConnectorContractService;
  readonly webhookRegistrations: WebhookRegistrationService;
  readonly webhookDeliveries: WebhookDeliveryService;
}

/**
 * Resultado de uma operação de IntegrationManager. `command`/`events` estão presentes exatamente nas
 * duas operações cujo Command já está catalogado em `COMMAND_CATALOG.md` e implementado nesta Sprint
 * (CreateConnector, RegisterWebhook) — mesmo padrão opcional `{result, command?, events?}` já usado
 * pelo Knowledge Hub (IMP-015). `ImportData`/`ExportData`/`SynchronizeData` também estão catalogados,
 * mas não são implementados nesta Sprint — ver "Lacunas Arquiteturais" no relatório.
 */
export interface IntegrationOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command?: Command<unknown>;
  readonly events?: readonly Event<unknown>[];
}

let commandSequence = 0;
let eventSequence = 0;

function buildCommand<TPayload>(name: string, payload: TPayload): Command<TPayload> {
  commandSequence += 1;
  return { name, submissionId: `integration-cmd-${commandSequence}`, payload, contractVersion: "v1" };
}

function buildEvent<TPayload>(name: string, aggregateId: string, payload: TPayload): Event<TPayload> {
  eventSequence += 1;
  return { id: `integration-evt-${eventSequence}`, occurredAt: new Date(), aggregateId, contractVersion: "v1", name, payload };
}

/**
 * IntegrationManager — implementa o "Integration Manager" (`INTEGRATION_HUB.md`, Capítulo 7): "o
 * ponto de entrada e orquestrador central do Integration Hub... coordena os demais componentes
 * especializados e garante consistência antes de qualquer chamada externa, sem implementar, ele
 * mesmo, a lógica técnica de nenhum Connector individual."
 */
export class IntegrationManager {
  constructor(private readonly deps: IntegrationManagerDependencies) {}

  /** Command "CreateConnector" — registra um novo Connector no Connector Registry. */
  async createConnector(payload: CreateConnectorPayload): Promise<IntegrationOperationResult<Connector>> {
    const connector = await this.deps.connectors.register(payload.name, payload.protocol, payload.capabilities);

    const command = buildCommand<CreateConnectorPayload>("CreateConnector", payload);
    const events = [buildEvent<Connector>("ConnectorCreated", connector.connectorId, connector)];

    return { result: connector, command, events };
  }

  async findConnector(connectorId: string): Promise<IntegrationOperationResult<Connector | undefined>> {
    return { result: await this.deps.connectors.find(connectorId) };
  }

  async listConnectors(): Promise<IntegrationOperationResult<readonly Connector[]>> {
    return { result: await this.deps.connectors.list() };
  }

  /** Configuration Manager — nenhum Command catalogado para esta operação. */
  async configureConnector(connectorId: string, tenantId: string, parameters: Readonly<Record<string, string>>): Promise<IntegrationOperationResult<ConnectorConfiguration>> {
    return { result: await this.deps.configurations.configure(connectorId, tenantId, parameters) };
  }

  /** Versionamento de Contract — nenhum Command catalogado para esta operação. */
  async registerContract(connectorId: string, contractVersion: string): Promise<IntegrationOperationResult<ConnectorContract>> {
    return { result: await this.deps.contracts.register(connectorId, contractVersion) };
  }

  /** Webhook Manager — registro do endpoint em si, nunca confundir com o Command "RegisterWebhook" abaixo. Nenhum Command catalogado para esta operação. */
  async registerWebhookEndpoint(connectorId: string, tenantId: string, endpoint: string): Promise<IntegrationOperationResult<WebhookRegistration>> {
    return { result: await this.deps.webhookRegistrations.register(connectorId, tenantId, endpoint) };
  }

  /**
   * Command "RegisterWebhook" — apesar do nome, processa uma notificação já recebida em um endpoint
   * já registrado (`WebhookDelivery`), nunca cria um `WebhookRegistration` — ver
   * `RegisterWebhookPayload.ts`.
   */
  async registerWebhook(payload: RegisterWebhookPayload): Promise<IntegrationOperationResult<WebhookDelivery>> {
    const delivery = await this.deps.webhookDeliveries.record(payload.connectorId, payload.tenantId);

    const command = buildCommand<RegisterWebhookPayload>("RegisterWebhook", payload);
    const events = [buildEvent<WebhookDelivery>("WebhookDelivered", delivery.connectorId, delivery)];

    return { result: delivery, command, events };
  }
}
