/**
 * Subscription — o acordo de cobrança recorrente com um Cliente, definindo periodicidade, valor e
 * vigência; gera cobranças, mas nunca processa pagamento diretamente — toda cobrança gerada segue o
 * mesmo fluxo de Invoice e Payment já aplicável a qualquer outra cobrança (Blueprint, Capítulo 12).
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Subscription {
  /** Identificador da Subscription. */
  readonly subscriptionId: string;

  /** Financial Account à qual esta Subscription se refere. */
  readonly financialAccountId: string;

  /** Valor cobrado a cada ciclo. */
  readonly amount: number;

  /** Periodicidade, em dias, entre cada ciclo de cobrança. */
  readonly periodicityInDays: number;

  /** Se a Subscription está ativa. */
  readonly active: boolean;

  /** Momento de criação. */
  readonly createdAt: Date;
}
