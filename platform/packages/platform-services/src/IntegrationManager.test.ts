import { describe, expect, it } from 'vitest';
import { ConnectorConfigurationService } from './ConnectorConfigurationService';
import { ConnectorContractService } from './ConnectorContractService';
import { ConnectorService } from './ConnectorService';
import { IntegrationManager } from './IntegrationManager';
import { WebhookDeliveryService } from './WebhookDeliveryService';
import { WebhookRegistrationService } from './WebhookRegistrationService';
import {
  FakeConnectorConfigurationRepository,
  FakeConnectorContractRepository,
  FakeConnectorRepository,
  FakeWebhookDeliveryRepository,
  FakeWebhookRegistrationRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const manager = new IntegrationManager({
    connectors: new ConnectorService(new FakeConnectorRepository()),
    configurations: new ConnectorConfigurationService(new FakeConnectorConfigurationRepository()),
    contracts: new ConnectorContractService(new FakeConnectorContractRepository()),
    webhookRegistrations: new WebhookRegistrationService(new FakeWebhookRegistrationRepository()),
    webhookDeliveries: new WebhookDeliveryService(new FakeWebhookDeliveryRepository()),
  });

  return { manager };
}

describe('IntegrationManager — "o ponto de entrada e orquestrador central do Integration Hub"', () => {
  it('createConnector carrega command "CreateConnector" e evento "ConnectorCreated" — catálogo formal existe para este domínio', async () => {
    const { manager } = buildManager();

    const created = await manager.createConnector({ name: 'Stripe', protocol: 'REST', capabilities: ['payment'] });

    expect(created.result.name).toBe('Stripe');
    expect(created.command?.name).toBe('CreateConnector');
    expect(created.events?.[0]?.name).toBe('ConnectorCreated');
  });

  it('configureConnector/registerContract/registerWebhookEndpoint nunca carregam command nem events — nenhum catálogo aprovado existe para essas operações', async () => {
    const { manager } = buildManager();
    const created = await manager.createConnector({ name: 'WhatsApp Business', protocol: 'Webhook', capabilities: ['messaging'] });

    const configured = await manager.configureConnector(created.result.connectorId, 'tenant-1', { syncInterval: '5m' });

    expect(configured.result.parameters.syncInterval).toBe('5m');
    expect('command' in configured).toBe(false);
    expect('events' in configured).toBe(false);
  });

  it('registerWebhook carrega command "RegisterWebhook" e evento "WebhookDelivered" — nunca cria um WebhookRegistration', async () => {
    const { manager } = buildManager();
    const created = await manager.createConnector({ name: 'Stripe', protocol: 'REST', capabilities: ['payment'] });

    const delivered = await manager.registerWebhook({ connectorId: created.result.connectorId, tenantId: 'tenant-1' });

    expect(delivered.command?.name).toBe('RegisterWebhook');
    expect(delivered.events?.[0]?.name).toBe('WebhookDelivered');
    expect(delivered.result.connectorId).toBe(created.result.connectorId);
  });

  it('registerWebhookEndpoint (Webhook Manager) e registerWebhook (Command) produzem entidades distintas', async () => {
    const { manager } = buildManager();
    const created = await manager.createConnector({ name: 'Stripe', protocol: 'REST', capabilities: ['payment'] });

    const endpoint = await manager.registerWebhookEndpoint(created.result.connectorId, 'tenant-1', 'https://tenant-1.example.com/hook');
    const delivery = await manager.registerWebhook({ connectorId: created.result.connectorId, tenantId: 'tenant-1' });

    expect('endpoint' in endpoint.result).toBe(true);
    expect('receivedAt' in delivery.result).toBe(true);
  });

  it('registerContract acompanha versionamento de Contract, sem Command catalogado', async () => {
    const { manager } = buildManager();
    const created = await manager.createConnector({ name: 'Stripe', protocol: 'REST', capabilities: ['payment'] });

    const contract = await manager.registerContract(created.result.connectorId, '1.0.0');

    expect(contract.result.contractVersion).toBe('1.0.0');
    expect('command' in contract).toBe(false);
  });
});
