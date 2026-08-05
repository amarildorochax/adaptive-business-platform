import { describe, expect, it } from 'vitest';
import { InvoiceService } from './InvoiceService';
import { FakeInvoiceRepository } from './testing/InMemoryFakes';

describe('InvoiceService', () => {
  it('cria uma Invoice sempre no estado Open', async () => {
    const service = new InvoiceService(new FakeInvoiceRepository());

    const invoice = await service.create({
      tenantId: 'tenant-1',
      financialAccountId: 'account-1',
      totalAmount: 199.9,
      dueAt: new Date('2026-08-30'),
    });

    expect(invoice.status).toBe('Open');
  });

  it('update falha quando a Invoice já está paga', async () => {
    const service = new InvoiceService(new FakeInvoiceRepository());
    const invoice = await service.create({
      tenantId: 'tenant-1',
      financialAccountId: 'account-1',
      totalAmount: 100,
      dueAt: new Date('2026-08-30'),
    });
    await service.markPaid(invoice.invoiceId);

    await expect(service.update(invoice.invoiceId, 150)).rejects.toThrow();
  });

  it('cancel preserva o registro — nunca remove a Invoice (CancelledInvoicePreservesHistory)', async () => {
    const service = new InvoiceService(new FakeInvoiceRepository());
    const invoice = await service.create({
      tenantId: 'tenant-1',
      financialAccountId: 'account-1',
      totalAmount: 100,
      dueAt: new Date('2026-08-30'),
    });

    const cancelled = await service.cancel(invoice.invoiceId);

    expect(cancelled.status).toBe('Cancelled');
    expect(await service.get(invoice.invoiceId)).toBeDefined();
  });
});
