import { describe, expect, it } from 'vitest';
import { ConnectorConfigurationService } from './ConnectorConfigurationService';
import { FakeConnectorConfigurationRepository } from './testing/InMemoryFakes';

describe('ConnectorConfigurationService — "Configuration over Code"', () => {
  it('current reflete a Configuration mais recente, nunca uma anterior', async () => {
    const service = new ConnectorConfigurationService(new FakeConnectorConfigurationRepository());
    await service.configure('connector-1', 'tenant-1', { syncInterval: '15m' });
    await service.configure('connector-1', 'tenant-1', { syncInterval: '5m' });

    const current = await service.current('connector-1', 'tenant-1');

    expect(current?.parameters.syncInterval).toBe('5m');
  });

  it('current nunca mistura Configuration de outro Tenant', async () => {
    const service = new ConnectorConfigurationService(new FakeConnectorConfigurationRepository());
    await service.configure('connector-1', 'tenant-1', { field: 'a' });
    await service.configure('connector-1', 'tenant-2', { field: 'b' });

    const current = await service.current('connector-1', 'tenant-1');

    expect(current?.parameters.field).toBe('a');
  });
});
