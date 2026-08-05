import type { Balance } from '../Balance';
import type { BalanceRepository } from '../BalanceRepository';
import type { FinancialAccount } from '../FinancialAccount';
import type { FinancialAccountRepository } from '../FinancialAccountRepository';
import type { Invoice } from '../Invoice';
import type { InvoiceItem } from '../InvoiceItem';
import type { InvoiceItemRepository } from '../InvoiceItemRepository';
import type { InvoiceRepository } from '../InvoiceRepository';
import type { LedgerEntry } from '../LedgerEntry';
import type { LedgerEntryRepository } from '../LedgerEntryRepository';
import type { Payment } from '../Payment';
import type { PaymentAttempt } from '../PaymentAttempt';
import type { PaymentAttemptRepository } from '../PaymentAttemptRepository';
import type { PaymentRepository } from '../PaymentRepository';
import type { Refund } from '../Refund';
import type { RefundRepository } from '../RefundRepository';
import type { Subscription } from '../Subscription';
import type { SubscriptionRepository } from '../SubscriptionRepository';
import type { TaxRecord } from '../TaxRecord';
import type { TaxRecordRepository } from '../TaxRecordRepository';
import type { Transaction } from '../Transaction';
import type { TransactionRepository } from '../TransactionRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-007, Etapa 9). Mesmo padrão já usado por
 * `@abp/crm-hub` (IMP-002), `@abp/communication-hub` (IMP-003), `@abp/content-hub` (IMP-004),
 * `@abp/growth-hub` (IMP-005) e `@abp/commerce-hub` (IMP-006) — nunca exportados pelo barrel do
 * pacote, nunca referenciados por nenhum Service em produção.
 */

export class FakeFinancialAccountRepository implements FinancialAccountRepository {
  private readonly rows = new Map<string, FinancialAccount>();
  async create(account: FinancialAccount) {
    this.rows.set(account.financialAccountId, account);
    return account;
  }
  async get(financialAccountId: string) {
    return this.rows.get(financialAccountId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((a) => a.tenantId === tenantId);
  }
}

export class FakeInvoiceRepository implements InvoiceRepository {
  private readonly rows = new Map<string, Invoice>();
  async create(invoice: Invoice) {
    this.rows.set(invoice.invoiceId, invoice);
    return invoice;
  }
  async update(invoice: Invoice) {
    this.rows.set(invoice.invoiceId, invoice);
    return invoice;
  }
  async get(invoiceId: string) {
    return this.rows.get(invoiceId);
  }
  async list(financialAccountId: string) {
    return [...this.rows.values()].filter((i) => i.financialAccountId === financialAccountId);
  }
}

export class FakeInvoiceItemRepository implements InvoiceItemRepository {
  private readonly rows: InvoiceItem[] = [];
  async create(invoiceItem: InvoiceItem) {
    this.rows.push(invoiceItem);
    return invoiceItem;
  }
  async list(invoiceId: string) {
    return this.rows.filter((i) => i.invoiceId === invoiceId);
  }
}

export class FakePaymentRepository implements PaymentRepository {
  private readonly rows = new Map<string, Payment>();
  async create(payment: Payment) {
    this.rows.set(payment.paymentId, payment);
    return payment;
  }
  async update(payment: Payment) {
    this.rows.set(payment.paymentId, payment);
    return payment;
  }
  async get(paymentId: string) {
    return this.rows.get(paymentId);
  }
  async list(invoiceId: string) {
    return [...this.rows.values()].filter((p) => p.invoiceId === invoiceId);
  }
}

export class FakePaymentAttemptRepository implements PaymentAttemptRepository {
  private readonly rows: PaymentAttempt[] = [];
  async create(paymentAttempt: PaymentAttempt) {
    this.rows.push(paymentAttempt);
    return paymentAttempt;
  }
  async list(paymentId: string) {
    return this.rows.filter((a) => a.paymentId === paymentId);
  }
}

export class FakeRefundRepository implements RefundRepository {
  private readonly rows = new Map<string, Refund>();
  async create(refund: Refund) {
    this.rows.set(refund.refundId, refund);
    return refund;
  }
  async get(refundId: string) {
    return this.rows.get(refundId);
  }
  async list(paymentId: string) {
    return [...this.rows.values()].filter((r) => r.paymentId === paymentId);
  }
}

export class FakeSubscriptionRepository implements SubscriptionRepository {
  private readonly rows = new Map<string, Subscription>();
  async create(subscription: Subscription) {
    this.rows.set(subscription.subscriptionId, subscription);
    return subscription;
  }
  async update(subscription: Subscription) {
    this.rows.set(subscription.subscriptionId, subscription);
    return subscription;
  }
  async get(subscriptionId: string) {
    return this.rows.get(subscriptionId);
  }
  async list(financialAccountId: string) {
    return [...this.rows.values()].filter((s) => s.financialAccountId === financialAccountId);
  }
}

export class FakeTransactionRepository implements TransactionRepository {
  private readonly rows = new Map<string, Transaction>();
  async create(transaction: Transaction) {
    this.rows.set(transaction.transactionId, transaction);
    return transaction;
  }
  async get(transactionId: string) {
    return this.rows.get(transactionId);
  }
  async list(tenantId: string) {
    return [...this.rows.values()].filter((t) => t.tenantId === tenantId);
  }
}

export class FakeLedgerEntryRepository implements LedgerEntryRepository {
  private readonly rows: LedgerEntry[] = [];
  async create(ledgerEntry: LedgerEntry) {
    this.rows.push(ledgerEntry);
    return ledgerEntry;
  }
  async listByAccount(financialAccountId: string) {
    return this.rows.filter((e) => e.financialAccountId === financialAccountId);
  }
  async listByTransaction(transactionId: string) {
    return this.rows.filter((e) => e.transactionId === transactionId);
  }
}

export class FakeBalanceRepository implements BalanceRepository {
  private readonly rows = new Map<string, Balance>();
  async save(balance: Balance) {
    this.rows.set(balance.financialAccountId, balance);
    return balance;
  }
  async get(financialAccountId: string) {
    return this.rows.get(financialAccountId);
  }
}

export class FakeTaxRecordRepository implements TaxRecordRepository {
  private readonly rows: TaxRecord[] = [];
  async create(taxRecord: TaxRecord) {
    this.rows.push(taxRecord);
    return taxRecord;
  }
  async list(transactionId: string) {
    return this.rows.filter((t) => t.transactionId === transactionId);
  }
}
