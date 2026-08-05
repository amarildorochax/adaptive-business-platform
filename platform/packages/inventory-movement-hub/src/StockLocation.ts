/**
 * StockLocation — Aggregate independente do Inventory Movement Hub (`INVENTORY_MOVEMENT_HUB.md`,
 * Capítulo 4). Capability opcional (ADR-IM-003) — uma Empresa de porte pequeno, com um único ponto
 * físico, opera sem nenhuma instância de `StockLocation`, e todo `StockMovement`/`StockPosition`
 * omite `locationId` sem quebra de contrato (`INVENTORY_MOVEMENT_HUB.md`, Capítulo 11).
 */

/** Endereço — Value Object opcional, sem validação de formato nesta Sprint (fora de escopo de
 * `INVENTORY_MOVEMENT_HUB.md`, que o descreve apenas como "Value Object opcional", sem detalhar
 * estrutura interna — nenhum campo é inventado além do que a arquitetura já nomeia). */
export interface StockLocationAddress {
  readonly line: string;
}

export interface StockLocation {
  /** Identificador da Location. */
  readonly locationId: string;

  /** Tenant ao qual a Location pertence. */
  readonly tenantId: string;

  /** Nome da Location. */
  readonly name: string;

  /** Endereço, quando informado. */
  readonly address?: StockLocationAddress;

  /** Location inativa nunca é sugerida para nova movimentação — nenhuma regra desta Sprint impede
   * `StockMovement` histórico já associado a ela de permanecer legível. */
  readonly active: boolean;

  /** Momento de criação. */
  readonly createdAt: Date;
}
