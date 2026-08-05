import { describe, expect, it } from 'vitest';
import { SpanService } from './SpanService';
import { FakeSpanRepository } from './testing/InMemoryFakes';

describe('SpanService — Tracing e Distributed Trace', () => {
  it('start/finish produz um Span com startedAt e finishedAt preenchidos', async () => {
    const service = new SpanService(new FakeSpanRepository());

    const open = service.start('corr-1', 'finance-hub');
    const span = await service.finish(open);

    expect(span.module).toBe('finance-hub');
    expect(span.correlationId).toBe('corr-1');
    expect(span.finishedAt).toBeInstanceOf(Date);
  });

  it('getTrace compõe todos os Spans do mesmo Correlation ID, em ordem de início', async () => {
    const service = new SpanService(new FakeSpanRepository());
    const first = await service.finish(service.start('corr-1', 'crm-hub'));
    const second = await service.finish(service.start('corr-1', 'finance-hub'));
    await service.finish(service.start('corr-2', 'growth-hub'));

    const trace = await service.getTrace('corr-1');

    expect(trace).toHaveLength(2);
    expect(trace[0]?.module).toBe(first.module);
    expect(trace[1]?.module).toBe(second.module);
  });
});
