import type { FiscalDocument } from './FiscalDocument';

/**
 * FiscalDocumentRepository — contrato de persistência de FiscalDocument, especificado literalmente
 * por `FISCAL_HUB.md`, Capítulo 9. `findByOrigin(orderId)` segue a assinatura literal do
 * pseudocódigo — apenas `orderId`, mesmo quando a origem real de um documento é uma `invoiceId`
 * (Capítulo 9 não especifica uma segunda consulta por `invoiceId`, mantida ausente para não inventar
 * um método não previsto pela arquitetura).
 */
export interface FiscalDocumentRepository {
  findById(fiscalDocumentId: string): Promise<FiscalDocument | undefined>;
  findByOrigin(orderId: string): Promise<readonly FiscalDocument[]>;
  save(document: FiscalDocument): Promise<FiscalDocument>;
}
