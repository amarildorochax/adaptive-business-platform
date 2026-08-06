/**
 * FiscalObligation — Aggregate independente do Fiscal Hub (`FISCAL_HUB.md`, Capítulo 4): "representa
 * uma obrigação acessória periódica (por exemplo, uma declaração), com data de vencimento e status,
 * nunca a execução do cálculo em si." `type`/`periodicity` permanecem `string` — a arquitetura
 * (Capítulo 5) não especifica um enum fechado para nenhum dos dois, mesma disciplina conservadora de
 * nunca inventar uma restrição estrutural não escrita já aplicada por `BillOfMaterials.lines` (Production
 * Hub, IMP-501).
 */

/** Estado do Fiscal Obligation — enum fechado, `FISCAL_HUB.md`, Capítulo 5. */
export type FiscalObligationStatus = 'Pending' | 'Fulfilled' | 'Overdue';

export interface FiscalObligation {
  /** Identificador do Fiscal Obligation. */
  readonly fiscalObligationId: string;

  /** Tenant ao qual o Fiscal Obligation pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** Tipo da obrigação. */
  readonly type: string;

  /** Periodicidade da obrigação. */
  readonly periodicity: string;

  /** Data de vencimento. */
  readonly dueDate: Date;

  /** Estado atual. */
  readonly status: FiscalObligationStatus;

  /** Momento em que `MarkFiscalObligationFulfilled` transicionou este Fiscal Obligation para
   * `Fulfilled`. */
  readonly fulfilledAt?: Date;

  /** Momento de criação. */
  readonly createdAt: Date;

  /** Momento da última alteração. */
  readonly updatedAt: Date;
}

export function isValidFiscalObligation(obligation: Pick<FiscalObligation, 'type' | 'periodicity'>): boolean {
  return obligation.type.trim().length > 0 && obligation.periodicity.trim().length > 0;
}
