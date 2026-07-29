/**
 * Payment Method — o meio de pagamento registrado por um Cliente (cartão, boleto, transferência),
 * consultado no momento de processar um novo Charge. O Finance Hub nunca armazena dado sensível
 * completo — apenas referência tokenizada, delegada ao Provider externo via Integration Hub
 * (`FINANCE_HUB.md`, Capítulo 15).
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface PaymentMethod {
  /** Identificador do Payment Method. */
  readonly paymentMethodId: string;

  /** Financial Account à qual este método pertence. */
  readonly financialAccountId: string;

  /** Tipo do meio de pagamento (ex.: cartão, boleto, transferência). */
  readonly kind: string;

  /** Referência tokenizada — nunca o dado sensível completo. */
  readonly tokenReference: string;
}
