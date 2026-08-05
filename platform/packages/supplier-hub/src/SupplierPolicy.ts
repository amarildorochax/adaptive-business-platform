import type { Supplier, SupplierStatus } from './Supplier';

/**
 * SupplierPolicy — decisões puras de negócio do Supplier Hub, nunca lançam exceção (isso é
 * responsabilidade de `SupplierValidator`, que consulta esta Policy antes de decidir se lança um
 * `SupplierDomainError`). Cada função aqui é determinística e livre de efeito colateral.
 */

/**
 * Máquina de estados de `SupplierStatus` — apenas `Active → Disabled` e `Disabled → Active` são
 * transições legítimas; nenhuma transição para o mesmo estado é permitida (`SUPPLIER_HUB.md`,
 * Capítulo 6, `SupplierStatus`).
 */
export function canTransitionStatus(from: SupplierStatus, to: SupplierStatus): boolean {
  if (from === to) {
    return false;
  }

  return (from === 'Active' && to === 'Disabled') || (from === 'Disabled' && to === 'Active');
}

/**
 * Predicado exposto para consumo futuro do Purchase Hub — "Um Supplier desabilitado
 * (SupplierDisabled) bloqueia a criação de novo Purchase Order contra ele (regra aplicada pelo
 * Purchase Hub...)" (`SUPPLIER_HUB.md`, Capítulo 11). O Supplier Hub nunca aplica esta regra
 * internamente sobre si mesmo — apenas expõe a decisão pura para que o futuro `PurchaseManager`
 * (IMP-301 ou Sprint equivalente) a consuma ao validar `supplierId` de um novo Purchase Order.
 */
export function isEligibleForNewPurchaseOrder(supplier: Pick<Supplier, 'status'>): boolean {
  return supplier.status === 'Active';
}
