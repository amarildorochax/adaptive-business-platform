/**
 * WorkCenter — Aggregate independente e opcional do Production Hub (`PRODUCTION_HUB.md`, Capítulo 4)
 * — representa uma estação física ou lógica de produção; ausente por padrão em uma Empresa pequena
 * sem produção segmentada em etapas, mesma Capability opcional já aplicada por `StockLocation`
 * (`packages/inventory-movement-hub/src/StockLocation.ts`, ADR-IM-003).
 */
export interface WorkCenter {
  /** Identificador do Work Center. */
  readonly workCenterId: string;

  /** Tenant ao qual o Work Center pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** Nome do Work Center. */
  readonly name: string;

  /** Capacidade nominal, quando informada. */
  readonly nominalCapacity?: number;

  /** Work Center inativo nunca é sugerido para nova ProductionOrder — nenhuma regra desta Sprint
   * impede ProductionOrder histórica já associada a ele de permanecer legível, mesma disciplina de
   * `StockLocation.active`. */
  readonly active: boolean;

  /** Momento de criação. */
  readonly createdAt: Date;
}
