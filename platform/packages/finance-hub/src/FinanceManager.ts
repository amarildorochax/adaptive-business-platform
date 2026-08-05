import type { Balance } from './Balance';
import { BalanceService } from './BalanceService';
import type { FinancialAccount } from './FinancialAccount';
import { FinancialAccountService } from './FinancialAccountService';
import type { FinCommand, FinCommandType } from './FinCommand';
import type { FinEvent, FinEventType } from './FinEvent';
import type { Invoice } from './Invoice';
import { InvoiceService, type CreateInvoiceInput } from './InvoiceService';
import type { InvoiceItem } from './InvoiceItem';
import { InvoiceItemService } from './InvoiceItemService';
import type { LedgerEntry } from './LedgerEntry';
import { LedgerEntryService } from './LedgerEntryService';
import type { Payment } from './Payment';
import { PaymentService } from './PaymentService';
import { PaymentAttemptService } from './PaymentAttemptService';
import type { Refund } from './Refund';
import { RefundService } from './RefundService';
import type { Subscription } from './Subscription';
import { SubscriptionService } from './SubscriptionService';
import type { TaxRecord } from './TaxRecord';
import { TaxRecordService } from './TaxRecordService';
import { TransactionService } from './TransactionService';

export interface FinanceManagerDependencies {
  readonly financialAccounts: FinancialAccountService;
  readonly invoices: InvoiceService;
  readonly invoiceItems: InvoiceItemService;
  readonly payments: PaymentService;
  readonly paymentAttempts: PaymentAttemptService;
  readonly refunds: RefundService;
  readonly subscriptions: SubscriptionService;
  readonly transactions: TransactionService;
  readonly ledgerEntries: LedgerEntryService;
  readonly balances: BalanceService;
  readonly taxRecords: TaxRecordService;
}

/**
 * Resultado de uma operação de FinanceManager — a Entidade produzida, todo Event já aprovado
 * consequente, e o Command que a originou, quando a operação corresponde a um dos dezesseis Commands
 * já aprovados em `FinCommand.ts`. `command` é `undefined` para Financial Account e Tax Record —
 * nenhum dos dezesseis Commands cobre a criação dessas duas Entidades de apoio (mesmo tratamento já
 * dado a Organization/Contact em `CRMOperationResult`, IMP-002).
 */
export interface FinanceOperationResult<TEntity> {
  readonly result: TEntity;
  readonly command?: FinCommand;
  readonly events: readonly FinEvent[];
}

/**
 * FinanceManager — o componente "Finance Manager" já catalogado em `FinanceHubComponent.ts`,
 * implementado pela primeira vez nesta Sprint (IMP-007, Finance Core). Ponto de entrada único que
 * nunca contém, ele mesmo, regra de negócio de uma Entidade específica — mesma disciplina de
 * fronteira já demonstrada por `CRMManager`/`CommunicationManager`/`GrowthManager`/`CommerceManager`.
 *
 * Escopo desta Sprint (Finance Core): Financial Account, Invoice/Invoice Item, Payment/Payment
 * Attempt, Refund, Subscription, Transaction/Ledger Entry/Balance e Tax Record — nunca Settlement,
 * Reconciliation, Receivable, Payable, Wallet, Discount, Fee, Financial Adjustment, Financial
 * Document, Payment Method ou Charge, todos explicitamente fora de escopo ou adiados (ver relatório
 * desta Sprint).
 *
 * **Ledger Flow** (`FINANCE_HUB.md`, Capítulo 6) — toda operação que produz efeito financeiro real
 * (`capturePayment`, `issueRefund`) segue, sem exceção, a mesma sequência: cria o Ledger Entry
 * (apenas-anexar, nunca alterado depois), agrupa em uma Transaction imutável já inteiramente formada,
 * e recalcula o Balance do zero a partir de todo o Ledger da Financial Account (Balance Is Derived) —
 * nunca um incremento sobre um valor armazenado anteriormente.
 *
 * Não publica em nenhum Event Bus — `FinEvent` é retornado ao chamador, mesmo padrão já em uso por
 * todo Manager anterior desta série.
 */
export class FinanceManager {
  constructor(private readonly deps: FinanceManagerDependencies) {}

  /** Nenhum Command/Event aprovado cobre Financial Account — ver relatório desta Sprint. */
  async createFinancialAccount(tenantId: string, relationshipId?: string): Promise<FinanceOperationResult<FinancialAccount>> {
    const account = await this.deps.financialAccounts.create(tenantId, relationshipId);
    return { result: account, events: [] };
  }

  async createInvoice(
    input: CreateInvoiceInput,
    items: readonly { description: string; amount: number }[],
  ): Promise<FinanceOperationResult<{ invoice: Invoice; items: readonly InvoiceItem[] }>> {
    const account = await this.deps.financialAccounts.get(input.financialAccountId);

    if (!account) {
      throw new Error(`Financial Account ${input.financialAccountId} não encontrada.`);
    }

    const invoice = await this.deps.invoices.create(input);
    const createdItems = await Promise.all(items.map((item) => this.deps.invoiceItems.add(invoice.invoiceId, item.description, item.amount)));

    return {
      result: { invoice, items: createdItems },
      command: this.command('CreateInvoice'),
      events: [this.event('InvoiceCreated', input.financialAccountId)],
    };
  }

  async updateInvoice(invoiceId: string, totalAmount?: number, dueAt?: Date): Promise<FinanceOperationResult<Invoice>> {
    const invoice = await this.deps.invoices.update(invoiceId, totalAmount, dueAt);
    return { result: invoice, command: this.command('UpdateInvoice'), events: [this.event('InvoiceUpdated', invoice.financialAccountId)] };
  }

  /** Preserva histórico integralmente (CancelledInvoicePreservesHistory, `FinBusinessRule.ts`) — nunca remove a Invoice, apenas transiciona o Status. */
  async cancelInvoice(invoiceId: string): Promise<FinanceOperationResult<Invoice>> {
    const invoice = await this.deps.invoices.cancel(invoiceId);
    return { result: invoice, command: this.command('CancelInvoice'), events: [this.event('InvoiceCancelled', invoice.financialAccountId)] };
  }

  /** Cria o Payment Intent e obtém autorização — nesta Sprint, sem nenhum Provider real (Integration Hub fora de escopo), a autorização é uma transição de domínio determinística. */
  async authorizePayment(tenantId: string, invoiceId: string, amount: number): Promise<FinanceOperationResult<Payment>> {
    const created = await this.deps.payments.create(tenantId, invoiceId, amount);
    const authorized = await this.deps.payments.authorize(created.paymentId);
    await this.deps.paymentAttempts.record(authorized.paymentId, true);

    return { result: authorized, command: this.command('AuthorizePayment'), events: [this.event('PaymentAuthorized')] };
  }

  /**
   * Confirma a captura do Payment já autorizado e executa o Ledger Flow completo: Ledger Entry
   * (Credit) → Transaction → Balance recalculado → Invoice marcada como Paid. `financialAccountId` é
   * sempre derivado da Invoice associada — nunca exigido do chamador.
   */
  async capturePayment(paymentId: string): Promise<FinanceOperationResult<Payment>> {
    const captured = await this.deps.payments.capture(paymentId);
    await this.deps.paymentAttempts.record(paymentId, true);

    const invoice = await this.deps.invoices.get(captured.invoiceId);

    if (!invoice) {
      throw new Error(`Invoice ${captured.invoiceId} não encontrada.`);
    }

    const financialAccountId = invoice.financialAccountId;
    const transactionId = crypto.randomUUID();
    const ledgerEntry = await this.deps.ledgerEntries.record(financialAccountId, transactionId, 'Credit', captured.amount);
    await this.deps.transactions.create(captured.tenantId, transactionId, [ledgerEntry.ledgerEntryId]);
    await this.deps.balances.recalculate(financialAccountId);
    await this.deps.invoices.markPaid(captured.invoiceId);

    return {
      result: captured,
      command: this.command('CapturePayment'),
      events: [
        this.event('PaymentCaptured', financialAccountId),
        this.event('LedgerEntryCreated', financialAccountId),
        this.event('BalanceUpdated', financialAccountId),
        this.event('InvoicePaid', financialAccountId),
      ],
    };
  }

  /** Registra a falha de uma tentativa — nunca executa Ledger Flow, nada foi efetivamente cobrado. */
  async failPayment(paymentId: string): Promise<FinanceOperationResult<Payment>> {
    const failed = await this.deps.payments.fail(paymentId);
    await this.deps.paymentAttempts.record(paymentId, false);

    return { result: failed, command: this.command('FailPayment'), events: [this.event('PaymentFailed')] };
  }

  /**
   * Processa a devolução de um Payment já confirmado — sempre referencia o Payment original, nunca o
   * altera; produz um novo Ledger Entry (Debit) e uma nova Transaction, nunca modifica o Ledger Entry
   * original (RefundCreatesNewTransactions, `FinBusinessRule.ts`). `financialAccountId` é sempre
   * derivado da Invoice associada ao Payment original — nunca exigido do chamador.
   */
  async issueRefund(paymentId: string, amount: number): Promise<FinanceOperationResult<Refund>> {
    const payment = await this.deps.payments.get(paymentId);

    if (!payment) {
      throw new Error(`Payment ${paymentId} não encontrado.`);
    }

    const invoice = await this.deps.invoices.get(payment.invoiceId);

    if (!invoice) {
      throw new Error(`Invoice ${payment.invoiceId} não encontrada.`);
    }

    const financialAccountId = invoice.financialAccountId;
    const refund = await this.deps.refunds.process(payment.tenantId, paymentId, amount);

    const transactionId = crypto.randomUUID();
    const ledgerEntry = await this.deps.ledgerEntries.record(financialAccountId, transactionId, 'Debit', amount);
    await this.deps.transactions.create(payment.tenantId, transactionId, [ledgerEntry.ledgerEntryId]);
    await this.deps.balances.recalculate(financialAccountId);

    return {
      result: refund,
      command: this.command('IssueRefund'),
      events: [
        this.event('RefundIssued', financialAccountId),
        this.event('LedgerEntryCreated', financialAccountId),
        this.event('BalanceUpdated', financialAccountId),
      ],
    };
  }

  async createSubscription(financialAccountId: string, amount: number, periodicityInDays: number): Promise<FinanceOperationResult<Subscription>> {
    const subscription = await this.deps.subscriptions.create(financialAccountId, amount, periodicityInDays);
    return { result: subscription, command: this.command('CreateSubscription'), events: [this.event('SubscriptionCreated', financialAccountId)] };
  }

  async renewSubscription(subscriptionId: string): Promise<FinanceOperationResult<Subscription>> {
    const subscription = await this.deps.subscriptions.renew(subscriptionId);
    return {
      result: subscription,
      command: this.command('RenewSubscription'),
      events: [this.event('SubscriptionRenewed', subscription.financialAccountId)],
    };
  }

  /**
   * Aciona a geração de uma nova Invoice a partir de uma Subscription ativa (Blueprint, Capítulo 9,
   * "Subscription → Recurring Billing → Invoice → Payment") — nunca processa o Payment
   * correspondente, que segue o mesmo fluxo padrão de `authorizePayment`/`capturePayment`.
   */
  async generateRecurringInvoice(subscriptionId: string, dueAt: Date): Promise<FinanceOperationResult<Invoice>> {
    const subscription = await this.deps.subscriptions.get(subscriptionId);

    if (!subscription) {
      throw new Error(`Subscription ${subscriptionId} não encontrada.`);
    }

    if (!subscription.active) {
      throw new Error(`Subscription ${subscriptionId} não está ativa.`);
    }

    const account = await this.deps.financialAccounts.get(subscription.financialAccountId);

    if (!account) {
      throw new Error(`Financial Account ${subscription.financialAccountId} não encontrada.`);
    }

    const invoice = await this.deps.invoices.create({
      tenantId: account.tenantId,
      financialAccountId: subscription.financialAccountId,
      totalAmount: subscription.amount,
      dueAt,
    });

    return {
      result: invoice,
      command: this.command('GenerateRecurringInvoice'),
      events: [this.event('RecurringBillingExecuted', subscription.financialAccountId), this.event('InvoiceCreated', subscription.financialAccountId)],
    };
  }

  /** Nenhum Command/Event aprovado cobre Tax Record — ver relatório desta Sprint. */
  async registerTaxRecord(transactionId: string, amount: number): Promise<FinanceOperationResult<TaxRecord>> {
    const taxRecord = await this.deps.taxRecords.register(transactionId, amount);
    return { result: taxRecord, events: [] };
  }

  async getBalance(financialAccountId: string): Promise<Balance | undefined> {
    return this.deps.balances.get(financialAccountId);
  }

  async listLedgerEntries(financialAccountId: string): Promise<readonly LedgerEntry[]> {
    return this.deps.ledgerEntries.listByAccount(financialAccountId);
  }

  private command(type: FinCommandType): FinCommand {
    return { operationId: crypto.randomUUID(), type, requestedAt: new Date() };
  }

  private event(type: FinEventType, financialAccountId?: string): FinEvent {
    return { eventId: crypto.randomUUID(), type, financialAccountId, occurredAt: new Date() };
  }
}
