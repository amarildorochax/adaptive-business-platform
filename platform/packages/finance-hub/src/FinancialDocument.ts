/**
 * Financial Document — a materialização formal de uma Invoice, um Recibo ou um Comprovante, gerada
 * para consumo humano, com identidade de marca aplicada através do Branding Hub.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export type FinancialDocumentKind = "Invoice" | "Receipt" | "ProofOfPayment";

export interface FinancialDocument {
  /** Identificador do Financial Document. */
  readonly financialDocumentId: string;

  /** Tipo de documento. */
  readonly kind: FinancialDocumentKind;

  /** Entidade de origem (Invoice ou Payment) à qual este documento se refere. */
  readonly sourceId: string;

  /** Momento de geração. */
  readonly generatedAt: Date;
}
