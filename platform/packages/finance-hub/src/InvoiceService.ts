import type { Invoice } from './Invoice';
import type { InvoiceRepository } from './InvoiceRepository';

/** Campos aceitos por `InvoiceService.create()`. */
export type CreateInvoiceInput = Pick<Invoice, 'tenantId' | 'financialAccountId' | 'totalAmount' | 'dueAt'>;

/**
 * InvoiceService — nenhum precedente legado foi encontrado (`src/core/finance` modela
 * Revenue/Expense de forma agregada, nunca uma cobrança individual com Status e Invoice Item — ver
 * relatório desta Sprint). Nenhuma emissão de Evento aqui — responsabilidade exclusiva de
 * FinanceManager.
 */
export class InvoiceService {
  constructor(private readonly repository: InvoiceRepository) {}

  async create(input: CreateInvoiceInput): Promise<Invoice> {
    const invoice: Invoice = {
      invoiceId: crypto.randomUUID(),
      status: 'Open',
      createdAt: new Date(),
      ...input,
    };

    return this.repository.create(invoice);
  }

  /** Altera atributo de uma Invoice ainda não paga (Blueprint, Capítulo 10, "Update Invoice"). */
  async update(invoiceId: string, totalAmount?: number, dueAt?: Date): Promise<Invoice> {
    const existing = await this.repository.get(invoiceId);

    if (!existing) {
      throw new Error(`Invoice ${invoiceId} não encontrada.`);
    }

    if (existing.status === 'Paid') {
      throw new Error(`Invoice ${invoiceId} já paga — não pode ser atualizada.`);
    }

    return this.repository.update({
      ...existing,
      totalAmount: totalAmount ?? existing.totalAmount,
      dueAt: dueAt ?? existing.dueAt,
    });
  }

  async cancel(invoiceId: string): Promise<Invoice> {
    const existing = await this.repository.get(invoiceId);

    if (!existing) {
      throw new Error(`Invoice ${invoiceId} não encontrada.`);
    }

    return this.repository.update({ ...existing, status: 'Cancelled' });
  }

  async markPaid(invoiceId: string): Promise<Invoice> {
    const existing = await this.repository.get(invoiceId);

    if (!existing) {
      throw new Error(`Invoice ${invoiceId} não encontrada.`);
    }

    return this.repository.update({ ...existing, status: 'Paid' });
  }

  async get(invoiceId: string): Promise<Invoice | undefined> {
    return this.repository.get(invoiceId);
  }

  async list(financialAccountId: string): Promise<readonly Invoice[]> {
    return this.repository.list(financialAccountId);
  }
}
