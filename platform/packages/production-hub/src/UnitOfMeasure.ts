/**
 * UnitOfMeasure — Value Object, enum fechado da unidade de medida de uma `BOM Line`, nunca implícita
 * (`PRODUCTION_HUB.md`, Capítulo 6). Conjunto exato dos quatro exemplos citados literalmente por
 * aquele Capítulo ("unidade, quilograma, litro, metro") — nenhum valor adicional foi inventado por
 * esta Sprint, mesma disciplina de `MovementOrigin`
 * (`packages/inventory-movement-hub/src/MovementOrigin.ts`).
 */
export type UnitOfMeasure = 'Unit' | 'Kilogram' | 'Liter' | 'Meter';
