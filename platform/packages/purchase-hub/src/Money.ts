/**
 * Money — valor monetário e código de moeda. `PURCHASE_HUB.md`, Capítulo 6, descreve este Value
 * Object nos mesmos termos que `SUPPLIER_HUB.md` já usa para o seu próprio `Money` — nenhum pacote
 * compartilhado de Value Objects existe ainda no monorepo (mesma verificação de IMP-201, reconfirmada
 * nesta Sprint: `@abp/shared` não define `Money`). Esta é a SEGUNDA definição local independente do
 * mesmo conceito (a primeira é `packages/supplier-hub/src/Money.ts`) — oportunidade real de
 * abstração compartilhada, documentada em `IMP_301_PURCHASE_HUB_CORE_REPORT.md`, Seção "Qualidade",
 * mas deliberadamente NÃO executada nesta Sprint (proibido por escopo: "Não refatorar o Supplier Hub
 * neste Sprint"). Quando um pacote compartilhado de Value Objects existir, este tipo é candidato a
 * ser substituído por um import, nunca por uma nova definição paralela.
 */
export interface Money {
  /** Valor monetário, sempre não negativo. */
  readonly amount: number;

  /** Código da moeda (ex.: BRL, USD) — mesmo formato de `Money.currencyCode` em `@abp/supplier-hub`. */
  readonly currencyCode: string;
}

export function isValidMoney(money: Money): boolean {
  return Number.isFinite(money.amount) && money.amount >= 0 && money.currencyCode.length > 0;
}

export function addMoney(a: Money, b: Money): Money {
  return { amount: a.amount + b.amount, currencyCode: a.currencyCode };
}
