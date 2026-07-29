/**
 * Exchange Rate — a taxa de conversão entre moedas, quando aplicável, mantida em nível conceitual,
 * sem assumir integração com nenhum provedor específico de câmbio.
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface ExchangeRate {
  /** Moeda de origem. */
  readonly fromCurrency: string;

  /** Moeda de destino. */
  readonly toCurrency: string;

  /** Taxa de conversão. */
  readonly rate: number;
}
