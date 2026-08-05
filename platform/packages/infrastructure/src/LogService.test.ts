import { describe, expect, it } from 'vitest';
import { LogService } from './LogService';
import { FakeLogRecordRepository } from './testing/InMemoryFakes';

describe('LogService — "Logs registram toda execução de Command, de Query e de consumo de Evento"', () => {
  it('record persiste um LogRecord estruturado, sempre correlacionável', async () => {
    const service = new LogService(new FakeLogRecordRepository());

    const record = await service.record('finance-hub', 'info', 'Invoice criada', 'corr-1');

    expect(record.module).toBe('finance-hub');
    expect(record.level).toBe('info');
    expect(record.correlationId).toBe('corr-1');
  });

  it('listByCorrelationId retorna apenas os LogRecord da mesma requisição', async () => {
    const service = new LogService(new FakeLogRecordRepository());
    await service.record('finance-hub', 'info', 'primeiro', 'corr-1');
    await service.record('crm-hub', 'info', 'outro correlation id', 'corr-2');

    const records = await service.listByCorrelationId('corr-1');

    expect(records).toHaveLength(1);
    expect(records[0]?.message).toBe('primeiro');
  });
});
