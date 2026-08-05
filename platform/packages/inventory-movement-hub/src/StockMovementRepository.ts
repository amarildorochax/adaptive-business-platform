import type { StockMovement } from './StockMovement';

/**
 * StockMovementRepository — contrato de persistência de Stock Movement, especificado literalmente por
 * `INVENTORY_MOVEMENT_HUB.md`, Capítulo 9. `append` é deliberadamente nomeado de forma distinta de
 * `create`/`save` — reforça, já no contrato de interface, que este Aggregate é append-only, nunca
 * sujeito a update (Capítulo 9: "reforça, já no contrato de interface, que este Aggregate é
 * append-only"). Interface apenas — nenhuma implementação (SQLite, in-memory de produção) é definida
 * por esta Sprint; persistência é escopo de uma Sprint futura (IMP-402).
 */
export interface StockMovementRepository {
  append(movement: StockMovement): Promise<StockMovement>;
  findByProduct(productId: string, locationId?: string): Promise<readonly StockMovement[]>;
  findByOriginReference(originReferenceId: string): Promise<readonly StockMovement[]>;
}
