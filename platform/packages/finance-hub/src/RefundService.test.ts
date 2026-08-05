import { describe, expect, it } from 'vitest';
import { RefundService } from './RefundService';
import { FakeRefundRepository } from './testing/InMemoryFakes';

describe('RefundService', () => {
  it('process referencia o Payment original — nunca o altera', async () => {
    const service = new RefundService(new FakeRefundRepository());

    const refund = await service.process('tenant-1', 'payment-1', 49.9);

    expect(refund.paymentId).toBe('payment-1');
    expect(refund.amount).toBe(49.9);
  });

  it('acumula histórico de Refund por Payment — nunca substitui o anterior', async () => {
    const service = new RefundService(new FakeRefundRepository());

    await service.process('tenant-1', 'payment-1', 10);
    await service.process('tenant-1', 'payment-1', 5);

    const history = await service.list('payment-1');

    expect(history).toHaveLength(2);
  });
});
