import type { InvoiceItem } from './InvoiceItem';

/** Contrato de persistência de Invoice Item — apenas o contrato, per Etapa 7. Sem `update`/`remove` — uma linha existente nunca é alterada, apenas substituída por meio de `UpdateInvoice` recriando as linhas (ver `InvoiceService`). */
export interface InvoiceItemRepository {
  create(invoiceItem: InvoiceItem): Promise<InvoiceItem>;
  list(invoiceId: string): Promise<InvoiceItem[]>;
}
