import type { InvoiceItem } from './InvoiceItem';
import type { InvoiceItemRepository } from './InvoiceItemRepository';

/** InvoiceItemService — nenhum precedente legado foi encontrado. Nenhuma emissão de Evento aqui — nenhum Evento aprovado cobre Invoice Item isoladamente (ver relatório desta Sprint). */
export class InvoiceItemService {
  constructor(private readonly repository: InvoiceItemRepository) {}

  async add(invoiceId: string, description: string, amount: number): Promise<InvoiceItem> {
    const invoiceItem: InvoiceItem = { invoiceItemId: crypto.randomUUID(), invoiceId, description, amount };
    return this.repository.create(invoiceItem);
  }

  async list(invoiceId: string): Promise<readonly InvoiceItem[]> {
    return this.repository.list(invoiceId);
  }
}
