import { describe, expect, it } from 'vitest';
import { PaymentService } from './PaymentService';
import { FakePaymentRepository } from './testing/InMemoryFakes';

describe('PaymentService', () => {
  it('cria um Payment sempre no estado Intent', async () => {
    const service = new PaymentService(new FakePaymentRepository());

    const payment = await service.create('tenant-1', 'invoice-1', 199.9);

    expect(payment.status).toBe('Intent');
  });

  it('percorre o ciclo de vida Intent → Authorized → Captured', async () => {
    const service = new PaymentService(new FakePaymentRepository());
    const created = await service.create('tenant-1', 'invoice-1', 100);

    const authorized = await service.authorize(created.paymentId);
    expect(authorized.status).toBe('Authorized');

    const captured = await service.capture(created.paymentId);
    expect(captured.status).toBe('Captured');
  });

  it('fail transiciona para Failed', async () => {
    const service = new PaymentService(new FakePaymentRepository());
    const created = await service.create('tenant-1', 'invoice-1', 100);

    const failed = await service.fail(created.paymentId);

    expect(failed.status).toBe('Failed');
  });
});
