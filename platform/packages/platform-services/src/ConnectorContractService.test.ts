import { describe, expect, it } from 'vitest';
import { ConnectorContractService } from './ConnectorContractService';
import { FakeConnectorContractRepository } from './testing/InMemoryFakes';

describe('ConnectorContractService — "Versionamento é obrigatório para todo Connector e todo Contract" (ADR-005)', () => {
  it('currentVersion reflete o Contract mais recentemente registrado', async () => {
    const service = new ConnectorContractService(new FakeConnectorContractRepository());
    await service.register('connector-1', '1.0.0');
    await service.register('connector-1', '1.1.0');

    expect(await service.currentVersion('connector-1')).toBe('1.1.0');
  });
});
