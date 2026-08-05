/**
 * Money — valor monetário e código de moeda. `SUPPLIER_HUB.md`, Capítulo 6, descreve este Value
 * Object como "o mesmo já usado por Purchase Hub e Finance Hub, nunca reimplementado" — nenhum
 * pacote compartilhado com esse contrato existe ainda no monorepo (verificado: `@abp/shared` não
 * define Money nem Currency; `@abp/finance-hub` define apenas `Currency`, sem `Money`). Esta Sprint
 * define a forma mínima localmente, documentada como limitação em
 * `IMP_201_SUPPLIER_HUB_CORE_REPORT.md` — quando um pacote compartilhado de Value Objects existir,
 * este tipo é o primeiro candidato a ser substituído por um import, nunca por uma nova definição
 * paralela.
 */
export interface Money {
  /** Valor monetário, sempre não negativo. */
  readonly amount: number;

  /** Código da moeda (ex.: BRL, USD) — mesmo formato de `Currency.code` em `@abp/finance-hub`. */
  readonly currencyCode: string;
}

export function isValidMoney(money: Money): boolean {
  return Number.isFinite(money.amount) && money.amount >= 0 && money.currencyCode.length > 0;
}
