/**
 * SupplierCommand — os nove Commands do Supplier Hub, cada um idempotente através de um
 * identificador de operação único, mesma disciplina já aplicada por `CRMCommand`/`FinCommand`.
 * Estrutura definida em `SUPPLIER_HUB.md`, Capítulo 7.
 *
 * NOTA: `AddSupplierContact` e `UpdateSupplierCatalogItem` não possuem Evento correspondente em
 * `DOMAIN_EVENT_CATALOG.md` — documentado como incompletude da arquitetura aprovada em
 * `docs/implementation/IMP_201_SUPPLIER_HUB_CORE_REPORT.md`, Capítulo 2, nunca preenchido
 * silenciosamente por um Evento novo inventado nesta Sprint (per instrução explícita de IMP-201:
 * "Não criar eventos adicionais").
 */
export type SupplierCommandType =
  | 'RegisterSupplier'
  | 'UpdateSupplier'
  | 'DisableSupplier'
  | 'ReactivateSupplier'
  | 'AddSupplierContact'
  | 'RegisterSupplierCatalogItem'
  | 'UpdateSupplierCatalogItem'
  | 'CreateSupplierContract'
  | 'RecordSupplierPerformance';

export interface SupplierCommand {
  /** Identificador de operação, único por execução — garante Idempotência. */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: SupplierCommandType;

  /** Momento em que o Comando foi recebido pelo SupplierManager. */
  readonly requestedAt: Date;
}
