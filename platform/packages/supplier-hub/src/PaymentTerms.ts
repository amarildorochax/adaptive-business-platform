/**
 * PaymentTerms — prazo de pagamento acordado com um Supplier, consumido pelo Financial Hub
 * (extensão) no momento de criar uma Account Payable, nunca decidido pelo Financial Hub por conta
 * própria. Estrutura definida em `SUPPLIER_HUB.md`, Capítulo 6.
 */
export interface PaymentTerms {
  /** Número de dias entre o recebimento e o vencimento do pagamento. Zero significa à vista. */
  readonly dueInDays: number;
}

export function isValidPaymentTerms(terms: PaymentTerms): boolean {
  return Number.isInteger(terms.dueInDays) && terms.dueInDays >= 0;
}
