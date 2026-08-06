import type { FiscalDocumentLine } from './FiscalDocumentLine';

/**
 * FiscalDocument — Aggregate Root do Fiscal Hub (`FISCAL_HUB.md`, Capítulo 4): "representa o
 * documento fiscal formal de uma operação (venda, devolução, transferência...); uma vez emitido, é
 * imutável, exceto por seu próprio ciclo de cancelamento formal (nunca edição de conteúdo já
 * emitido)". Referencia exatamente uma origem já confirmada (Capítulo 11: "nunca é criado sem
 * correlação rastreável a uma transação real já confirmada") — `orderId` (Commerce Hub) e/ou
 * `invoiceId` (Finance Hub), ambos identificador opaco.
 */

/** Tipo do Fiscal Document — enum fechado, `FISCAL_HUB.md`, Capítulo 5. */
export type FiscalDocumentType = 'Sale' | 'Return' | 'Transfer';

/** Estado do Fiscal Document — enum fechado, `FISCAL_HUB.md`, Capítulo 5. Única transição permitida
 * após emissão: `Issued` → `Cancelled` (Capítulo 11). */
export type FiscalDocumentStatus = 'Issued' | 'Cancelled';

export interface FiscalDocument {
  /** Identificador do Fiscal Document. */
  readonly fiscalDocumentId: string;

  /** Tenant ao qual o Fiscal Document pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** Tipo da operação. */
  readonly type: FiscalDocumentType;

  /** Order de origem (Commerce Hub), por identificador opaco — presente quando a origem é uma venda
   * diretamente rastreável a um Order. */
  readonly orderId?: string;

  /** Invoice de origem (Finance Hub), por identificador opaco — presente quando a origem é rastreável
   * a uma Invoice já criada. Ao menos um entre `orderId`/`invoiceId` é sempre exigido
   * (`FiscalValidator.ensureFiscalDocumentHasOrigin`). */
  readonly invoiceId?: string;

  /** Linhas do documento — parte interna do Aggregate. */
  readonly lines: readonly FiscalDocumentLine[];

  /** Estado atual. */
  readonly status: FiscalDocumentStatus;

  /** Número do documento, quando aplicável ao regime tributário da Empresa. */
  readonly number?: string;

  /** Série do documento, quando aplicável ao regime tributário da Empresa. */
  readonly series?: string;

  /** Motivo do cancelamento, quando aplicável. */
  readonly cancelReason?: string;

  /** Momento de emissão. */
  readonly issuedAt: Date;

  /** Momento do cancelamento, quando aplicável. */
  readonly cancelledAt?: Date;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última alteração. */
  readonly updatedAt: Date;
}
