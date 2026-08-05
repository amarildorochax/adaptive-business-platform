import { describe, expect, it } from 'vitest';
import { ConnectorService } from './ConnectorService';
import { FakeConnectorRepository } from './testing/InMemoryFakes';

describe('ConnectorService — "o catálogo central de todo Connector disponível na plataforma"', () => {
  it('register cria um Connector com versão inicial "1"', async () => {
    const service = new ConnectorService(new FakeConnectorRepository());

    const connector = await service.register('Stripe', 'REST', ['payment']);

    expect(connector.name).toBe('Stripe');
    expect(connector.protocol).toBe('REST');
    expect(connector.version).toBe('1');
  });

  it('list retorna todos os Connectors já registrados', async () => {
    const service = new ConnectorService(new FakeConnectorRepository());
    await service.register('Stripe', 'REST', ['payment']);
    await service.register('WhatsApp Business', 'Webhook', ['messaging']);

    const results = await service.list();

    expect(results).toHaveLength(2);
  });
});
