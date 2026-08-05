/**
 * MovementOrigin — Value Object, enum fechado descrevendo a origem de um `StockMovement`, nunca
 * livre-texto, garantindo rastreabilidade total (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 6). Cada
 * origem corresponde a exatamente um dos quatro módulos com escrita legítima sobre o ledger físico
 * (Purchase, Production, Commerce, ajuste manual), per Nota de Posicionamento Documental daquele
 * documento.
 *
 * `ProductionConsumption`/`ProductionOutput` sempre exigem `originReferenceId` (referência a uma
 * Production Order existente, `INVENTORY_MOVEMENT_HUB.md`, Capítulo 11: "nunca criado sem correlação
 * rastreável") — verificado por `InventoryValidator.ensureOriginReferenceProvidedWhenRequired`.
 */
export type MovementOrigin =
  | 'Purchase'
  | 'ProductionConsumption'
  | 'ProductionOutput'
  | 'SaleFulfillment'
  | 'SaleReturn'
  | 'ManualAdjustment';

/** Origens que sempre exigem `originReferenceId` — nunca criadas sem correlação rastreável. */
const ORIGINS_REQUIRING_REFERENCE: readonly MovementOrigin[] = ['ProductionConsumption', 'ProductionOutput'];

export function requiresOriginReference(origin: MovementOrigin): boolean {
  return ORIGINS_REQUIRING_REFERENCE.includes(origin);
}
