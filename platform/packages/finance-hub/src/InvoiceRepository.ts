import type { Invoice } from './Invoice';

/** Contrato de persistência de Invoice — apenas o contrato, per Etapa 7. Sem `remove` — Cancelled preserva histórico integralmente (CancelledInvoicePreservesHistory, FinBusinessRule.ts). */
export interface InvoiceRepository {
  create(invoice: Invoice): Promise<Invoice>;
  update(invoice: Invoice): Promise<Invoice>;
  get(invoiceId: string): Promise<Invoice | undefined>;
  list(financialAccountId: string): Promise<Invoice[]>;
}
