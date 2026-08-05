import { computeQuantityAvailable } from '../InventoryPolicy';
import type { StockAlertRule } from '../StockAlertRule';
import type { StockAlertRuleRepository } from '../StockAlertRuleRepository';
import type { StockLocation } from '../StockLocation';
import type { StockLocationRepository } from '../StockLocationRepository';
import type { StockMovement } from '../StockMovement';
import type { StockMovementRepository } from '../StockMovementRepository';
import type { StockPosition } from '../StockPosition';
import type { StockPositionRepository } from '../StockPositionRepository';
import type { StockReservation } from '../StockReservation';
import type { StockReservationRepository } from '../StockReservationRepository';

/**
 * Fakes em memória usados exclusivamente por teste (IMP-401, mesmo padrão de
 * `packages/purchase-hub/src/testing/InMemoryFakes.ts`). Nunca exportados pelo barrel do pacote
 * (`index.ts`) — apenas pelo subpath `@abp/inventory-movement-hub/testing`, per `package.json`,
 * `exports`. O pacote de produção expõe apenas o contrato de Repository, nunca uma implementação de
 * persistência real — essa é escopo de uma Sprint futura (IMP-402).
 *
 * LIMITAÇÃO HERDADA DA ARQUITETURA (documentada, per instrução de IMP-401 — "Nunca corrigir
 * silenciosamente"): `StockMovementRepository.findByProduct`/`StockPositionRepository.findByProduct`/
 * `recalculate` e `StockReservationRepository.findActiveByProduct` são especificados literalmente por
 * `INVENTORY_MOVEMENT_HUB.md`, Capítulo 9, apenas com `productId`/`locationId?` — nenhum parâmetro
 * `variantId` existe no contrato de consulta, mesmo `StockMovement`/`StockPosition`/`StockReservation`
 * carregando `variantId` como campo próprio (Capítulo 5). Esta Sprint implementa o contrato
 * exatamente como especificado (nunca adiciona um parâmetro `variantId` não previsto pela
 * arquitetura) — Fakes abaixo filtram apenas por `productId`/`locationId`, mesma granularidade do
 * contrato real. Detalhado em `IMP_401_INVENTORY_MOVEMENT_HUB_CORE_REPORT.md`, Seção "Divergências
 * Encontradas".
 */

export class FakeStockMovementRepository implements StockMovementRepository {
  readonly rows: StockMovement[] = [];

  async append(movement: StockMovement) {
    this.rows.push(movement);
    return movement;
  }

  async findByProduct(productId: string, locationId?: string) {
    return this.rows.filter((m) => m.productId === productId && (locationId === undefined || m.locationId === locationId));
  }

  async findByOriginReference(originReferenceId: string) {
    return this.rows.filter((m) => m.originReferenceId === originReferenceId);
  }
}

export class FakeStockReservationRepository implements StockReservationRepository {
  private readonly rows = new Map<string, StockReservation>();

  async create(reservation: StockReservation) {
    this.rows.set(reservation.reservationId, reservation);
    return reservation;
  }

  async update(reservation: StockReservation) {
    this.rows.set(reservation.reservationId, reservation);
    return reservation;
  }

  async findById(reservationId: string) {
    return this.rows.get(reservationId);
  }

  async findActiveByProduct(productId: string, locationId?: string) {
    return [...this.rows.values()].filter(
      (r) => r.productId === productId && r.status === 'Active' && (locationId === undefined || r.locationId === locationId),
    );
  }

  async findByOrder(orderId: string) {
    return [...this.rows.values()].filter((r) => r.orderId === orderId);
  }
}

/**
 * `recalculate` implementa, em memória, exatamente o que uma futura implementação SQLite (IMP-402)
 * fará com um `SUM` agregado — soma de `quantityDelta` de `FakeStockMovementRepository` e de
 * quantidade de `FakeStockReservationRepository` — por isso recebe ambos por referência no
 * construtor. Esta dependência entre Fakes nunca existe na interface de produção (`StockPositionRepository`
 * não referencia nenhum outro Repository) — é uma liberdade exclusiva de teste, documentada aqui,
 * que espelha fielmente o comportamento real que a Persistência produzirá.
 */
export class FakeStockPositionRepository implements StockPositionRepository {
  private readonly cache = new Map<string, StockPosition>();

  constructor(
    private readonly movementRepository: FakeStockMovementRepository,
    private readonly reservationRepository: StockReservationRepository,
  ) {}

  async findByProduct(productId: string, locationId?: string) {
    return this.cache.get(this.key(productId, locationId));
  }

  async recalculate(productId: string, locationId?: string) {
    const movements = await this.movementRepository.findByProduct(productId, locationId);
    const quantityOnHand = movements.reduce((sum, m) => sum + m.quantityDelta, 0);

    const activeReservations = await this.reservationRepository.findActiveByProduct(productId, locationId);
    const quantityReserved = activeReservations.reduce((sum, r) => sum + r.quantity, 0);

    const position: StockPosition = {
      productId,
      locationId,
      quantityOnHand,
      quantityReserved,
      quantityAvailable: computeQuantityAvailable(quantityOnHand, quantityReserved),
      recalculatedAt: new Date(),
    };

    this.cache.set(this.key(productId, locationId), position);
    return position;
  }

  private key(productId: string, locationId?: string) {
    return `${productId}::${locationId ?? ''}`;
  }
}

export class FakeStockLocationRepository implements StockLocationRepository {
  private readonly rows = new Map<string, StockLocation>();

  async create(location: StockLocation) {
    this.rows.set(location.locationId, location);
    return location;
  }

  async findById(locationId: string) {
    return this.rows.get(locationId);
  }

  async findAllActive(tenantId: string) {
    return [...this.rows.values()].filter((l) => l.tenantId === tenantId && l.active);
  }
}

export class FakeStockAlertRuleRepository implements StockAlertRuleRepository {
  private readonly rows = new Map<string, StockAlertRule>();

  async create(rule: StockAlertRule) {
    this.rows.set(rule.ruleId, rule);
    return rule;
  }

  async update(rule: StockAlertRule) {
    this.rows.set(rule.ruleId, rule);
    return rule;
  }

  async findById(ruleId: string) {
    return this.rows.get(ruleId);
  }

  async findActiveByProduct(productId: string, locationId?: string) {
    return [...this.rows.values()].find(
      (r) => r.productId === productId && r.active && (locationId === undefined || r.locationId === locationId),
    );
  }
}
