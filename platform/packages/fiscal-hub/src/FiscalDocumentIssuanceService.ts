import type { FiscalDocument } from './FiscalDocument';
import { FiscalDocumentNotFoundError } from './FiscalDomainError';
import { FiscalFactory, type IssueFiscalDocumentInput } from './FiscalFactory';
import type { FiscalDocumentRepository } from './FiscalDocumentRepository';
import { FiscalValidator } from './FiscalValidator';

/**
 * FiscalDocumentIssuanceService — "consome InvoiceCreated/OrderPaid e é o único ponto que publica
 * FiscalDocumentIssued; nunca emite um Documento Fiscal sem Tax Calculation completo associado a cada
 * linha" (`FISCAL_HUB.md`, Capítulo 10). Um dos três Services explicitamente nomeados por aquele
 * documento.
 *
 * LIMITE DE DOMÍNIO: este Service nunca consome `InvoiceCreated`/`OrderPaid` diretamente — nenhuma
 * implementação real de Event Bus existe ainda nesta plataforma (`ADAPTIVE_DEVELOPMENT_STANDARD.md`,
 * Capítulo 1.3). `issue` recebe os dados já confirmados da transação de origem como parâmetro
 * explícito do chamador (uma camada de integração futura, fora do escopo de um pacote de domínio
 * Core), nunca uma consulta real a `@abp/finance-hub`/`@abp/commerce-hub` — mesmo Limite de Domínio já
 * aplicado por `ProductionExecutionService.start` recebendo `availableQuantities`.
 */
export class FiscalDocumentIssuanceService {
  private readonly factory = new FiscalFactory();
  private readonly validator = new FiscalValidator();

  constructor(private readonly repository: FiscalDocumentRepository) {}

  async issue(input: IssueFiscalDocumentInput): Promise<FiscalDocument> {
    this.validator.ensureFiscalDocumentHasOrigin(input.orderId, input.invoiceId);

    for (const line of input.lines) {
      this.validator.ensureValidFiscalDocumentLine(line);
    }

    const document = this.factory.createFiscalDocument(input);
    return this.repository.save(document);
  }

  /** "Um Fiscal Document emitido é imutável quanto ao conteúdo — sua única transição posterior
   * permitida é Cancelled" (`FISCAL_HUB.md`, Capítulo 11). */
  async cancel(fiscalDocumentId: string, reason: string): Promise<FiscalDocument> {
    const existing = await this.getOrThrow(fiscalDocumentId);
    this.validator.ensureFiscalDocumentStatusTransitionAllowed(existing.status, 'Cancelled');

    return this.repository.save({
      ...existing,
      status: 'Cancelled',
      cancelledAt: new Date(),
      cancelReason: reason,
      updatedAt: new Date(),
    });
  }

  async get(fiscalDocumentId: string): Promise<FiscalDocument | undefined> {
    return this.repository.findById(fiscalDocumentId);
  }

  async listByOrigin(orderId: string): Promise<readonly FiscalDocument[]> {
    return this.repository.findByOrigin(orderId);
  }

  private async getOrThrow(fiscalDocumentId: string): Promise<FiscalDocument> {
    const existing = await this.repository.findById(fiscalDocumentId);

    if (!existing) {
      throw new FiscalDocumentNotFoundError(fiscalDocumentId);
    }

    return existing;
  }
}
