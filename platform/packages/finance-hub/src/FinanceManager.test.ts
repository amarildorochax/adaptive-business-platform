import { describe, expect, it } from 'vitest';
import { BalanceService } from './BalanceService';
import { FinancialAccountService } from './FinancialAccountService';
import { FinanceManager } from './FinanceManager';
import { InvoiceItemService } from './InvoiceItemService';
import { InvoiceService } from './InvoiceService';
import { LedgerEntryService } from './LedgerEntryService';
import { PaymentAttemptService } from './PaymentAttemptService';
import { PaymentService } from './PaymentService';
import { RefundService } from './RefundService';
import { SubscriptionService } from './SubscriptionService';
import { TaxRecordService } from './TaxRecordService';
import { TransactionService } from './TransactionService';
import {
  FakeBalanceRepository,
  FakeFinancialAccountRepository,
  FakeInvoiceItemRepository,
  FakeInvoiceRepository,
  FakeLedgerEntryRepository,
  FakePaymentAttemptRepository,
  FakePaymentRepository,
  FakeRefundRepository,
  FakeSubscriptionRepository,
  FakeTaxRecordRepository,
  FakeTransactionRepository,
} from './testing/InMemoryFakes';

function buildManager() {
  const ledgerEntryRepository = new FakeLedgerEntryRepository();

  return new FinanceManager({
    financialAccounts: new FinancialAccountService(new FakeFinancialAccountRepository()),
    invoices: new InvoiceService(new FakeInvoiceRepository()),
    invoiceItems: new InvoiceItemService(new FakeInvoiceItemRepository()),
    payments: new PaymentService(new FakePaymentRepository()),
    paymentAttempts: new PaymentAttemptService(new FakePaymentAttemptRepository()),
    refunds: new RefundService(new FakeRefundRepository()),
    subscriptions: new SubscriptionService(new FakeSubscriptionRepository()),
    transactions: new TransactionService(new FakeTransactionRepository()),
    ledgerEntries: new LedgerEntryService(ledgerEntryRepository),
    balances: new BalanceService(new FakeBalanceRepository(), ledgerEntryRepository),
    taxRecords: new TaxRecordService(new FakeTaxRecordRepository()),
  });
}

describe('FinanceManager — Finance Core', () => {
  it('createInvoice exige uma Financial Account já existente e produz o Command CreateInvoice / Event InvoiceCreated', async () => {
    const manager = buildManager();

    await expect(
      manager.createInvoice(
        { tenantId: 'tenant-1', financialAccountId: 'account-inexistente', totalAmount: 100, dueAt: new Date('2026-09-01') },
        [],
      ),
    ).rejects.toThrow();

    const { result: account } = await manager.createFinancialAccount('tenant-1');
    const operation = await manager.createInvoice(
      { tenantId: 'tenant-1', financialAccountId: account.financialAccountId, totalAmount: 199.9, dueAt: new Date('2026-09-01') },
      [{ description: 'Plano mensal', amount: 199.9 }],
    );

    expect(operation.result.invoice.status).toBe('Open');
    expect(operation.result.items).toHaveLength(1);
    expect(operation.command?.type).toBe('CreateInvoice');
    expect(operation.events.map((e) => e.type)).toEqual(['InvoiceCreated']);
  });

  it('ciclo completo Invoice → Payment → Ledger → Balance: capturePayment marca a Invoice como Paid e recalcula o Balance a partir do Ledger', async () => {
    const manager = buildManager();
    const { result: account } = await manager.createFinancialAccount('tenant-1');
    const { result: created } = await manager.createInvoice(
      { tenantId: 'tenant-1', financialAccountId: account.financialAccountId, totalAmount: 300, dueAt: new Date('2026-09-01') },
      [],
    );

    const authorized = await manager.authorizePayment('tenant-1', created.invoice.invoiceId, 300);
    expect(authorized.result.status).toBe('Authorized');
    expect(authorized.command?.type).toBe('AuthorizePayment');
    expect(authorized.events.map((e) => e.type)).toEqual(['PaymentAuthorized']);

    const captured = await manager.capturePayment(authorized.result.paymentId);
    expect(captured.result.status).toBe('Captured');
    expect(captured.command?.type).toBe('CapturePayment');
    expect(captured.events.map((e) => e.type)).toEqual(['PaymentCaptured', 'LedgerEntryCreated', 'BalanceUpdated', 'InvoicePaid']);

    await expect(manager.updateInvoice(created.invoice.invoiceId, 250)).rejects.toThrow();

    const balance = await manager.getBalance(account.financialAccountId);
    expect(balance?.amount).toBe(300);

    const ledgerEntries = await manager.listLedgerEntries(account.financialAccountId);
    expect(ledgerEntries).toHaveLength(1);
    expect(ledgerEntries[0]?.type).toBe('Credit');
  });

  it('issueRefund nunca altera o Ledger Entry original — produz um novo Ledger Entry (Debit) e reduz o Balance', async () => {
    const manager = buildManager();
    const { result: account } = await manager.createFinancialAccount('tenant-1');
    const { result: created } = await manager.createInvoice(
      { tenantId: 'tenant-1', financialAccountId: account.financialAccountId, totalAmount: 300, dueAt: new Date('2026-09-01') },
      [],
    );
    const { result: authorized } = await manager.authorizePayment('tenant-1', created.invoice.invoiceId, 300);
    await manager.capturePayment(authorized.paymentId);

    const refunded = await manager.issueRefund(authorized.paymentId, 100);

    expect(refunded.result.amount).toBe(100);
    expect(refunded.command?.type).toBe('IssueRefund');
    expect(refunded.events.map((e) => e.type)).toEqual(['RefundIssued', 'LedgerEntryCreated', 'BalanceUpdated']);

    const balance = await manager.getBalance(account.financialAccountId);
    expect(balance?.amount).toBe(200);

    const ledgerEntries = await manager.listLedgerEntries(account.financialAccountId);
    expect(ledgerEntries).toHaveLength(2);
    expect(ledgerEntries[0]?.amount).toBe(300);
  });

  it('failPayment nunca executa o Ledger Flow — nenhum Ledger Entry é criado', async () => {
    const manager = buildManager();
    const { result: account } = await manager.createFinancialAccount('tenant-1');
    const { result: created } = await manager.createInvoice(
      { tenantId: 'tenant-1', financialAccountId: account.financialAccountId, totalAmount: 100, dueAt: new Date('2026-09-01') },
      [],
    );
    const { result: authorized } = await manager.authorizePayment('tenant-1', created.invoice.invoiceId, 100);

    const failed = await manager.failPayment(authorized.paymentId);

    expect(failed.result.status).toBe('Failed');
    expect(failed.events.map((e) => e.type)).toEqual(['PaymentFailed']);

    const ledgerEntries = await manager.listLedgerEntries(account.financialAccountId);
    expect(ledgerEntries).toHaveLength(0);
  });

  it('cancelInvoice produz o Event InvoiceCancelled', async () => {
    const manager = buildManager();
    const { result: account } = await manager.createFinancialAccount('tenant-1');
    const { result: created } = await manager.createInvoice(
      { tenantId: 'tenant-1', financialAccountId: account.financialAccountId, totalAmount: 100, dueAt: new Date('2026-09-01') },
      [],
    );

    const cancelled = await manager.cancelInvoice(created.invoice.invoiceId);

    expect(cancelled.result.status).toBe('Cancelled');
    expect(cancelled.events.map((e) => e.type)).toEqual(['InvoiceCancelled']);
  });

  it('ciclo Subscription → Recurring Billing → Invoice: createSubscription, renewSubscription e generateRecurringInvoice', async () => {
    const manager = buildManager();
    const { result: account } = await manager.createFinancialAccount('tenant-1');

    const created = await manager.createSubscription(account.financialAccountId, 49.9, 30);
    expect(created.result.active).toBe(true);
    expect(created.command?.type).toBe('CreateSubscription');
    expect(created.events.map((e) => e.type)).toEqual(['SubscriptionCreated']);

    const renewed = await manager.renewSubscription(created.result.subscriptionId);
    expect(renewed.command?.type).toBe('RenewSubscription');
    expect(renewed.events.map((e) => e.type)).toEqual(['SubscriptionRenewed']);

    const recurring = await manager.generateRecurringInvoice(created.result.subscriptionId, new Date('2026-10-01'));
    expect(recurring.result.totalAmount).toBe(49.9);
    expect(recurring.command?.type).toBe('GenerateRecurringInvoice');
    expect(recurring.events.map((e) => e.type)).toEqual(['RecurringBillingExecuted', 'InvoiceCreated']);
  });

  it('createFinancialAccount e registerTaxRecord nunca carregam Command nem emitem Event — nenhum está aprovado para essas Entidades de apoio', async () => {
    const manager = buildManager();

    const account = await manager.createFinancialAccount('tenant-1');
    const taxRecord = await manager.registerTaxRecord('transaction-1', 12.5);

    expect(account.command).toBeUndefined();
    expect(account.events).toEqual([]);
    expect(taxRecord.command).toBeUndefined();
    expect(taxRecord.events).toEqual([]);
  });
});
