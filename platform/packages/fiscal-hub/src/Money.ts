/**
 * Money — valor monetário e código de moeda. `FISCAL_HUB.md`, Capítulo 6, descreve este Value Object
 * como "o mesmo Value Object já usado em toda a plataforma" — mas nenhum pacote compartilhado de
 * Value Objects existe ainda no monorepo (mesma verificação já feita por IMP-201/IMP-301,
 * reconfirmada nesta Sprint: `@abp/shared` não define `Money`). Esta é a TERCEIRA definição local
 * independente do mesmo conceito (a primeira é `packages/supplier-hub/src/Money.ts`, a segunda
 * `packages/purchase-hub/src/Money.ts`) — mesma oportunidade real de abstração compartilhada já
 * documentada por IMP-301, deliberadamente NÃO executada nesta Sprint (fora de escopo: "somente
 * Core"). Quando um pacote compartilhado de Value Objects existir, este tipo é candidato a ser
 * substituído por um import, nunca por uma nova definição paralela.
 */
export interface Money {
  /** Valor monetário, sempre não negativo. */
  readonly amount: number;

  /** Código da moeda (ex.: BRL, USD) — mesmo formato de `Money.currencyCode` em `@abp/supplier-hub`/
   * `@abp/purchase-hub`. */
  readonly currencyCode: string;
}

export function isValidMoney(money: Money): boolean {
  return Number.isFinite(money.amount) && money.amount >= 0 && money.currencyCode.length > 0;
}
