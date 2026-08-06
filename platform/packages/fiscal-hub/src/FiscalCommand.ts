/**
 * FiscalCommand — os oito Commands do Fiscal Hub, cada um idempotente através de um identificador de
 * operação único, mesma disciplina já aplicada por `ProductionCommand`/`InventoryCommand`/
 * `PurchaseCommand`/`SupplierCommand`. Conjunto exato de `FISCAL_HUB.md`, Capítulo 7 — nenhum Command
 * adicional foi criado por esta Sprint.
 *
 * NOTA (divergência documentada, per instrução explícita desta Sprint — "Nunca inventar eventos"):
 * `RegisterTaxRegime`, `DeactivateTaxRule` e `MarkFiscalObligationFulfilled` não possuem Evento
 * correspondente em `DOMAIN_EVENT_CATALOG.md` (que cataloga apenas seis Eventos para este Hub —
 * nenhum "TaxRegimeRegistered", nenhum "TaxRuleDeactivated", nenhum "FiscalObligationFulfilled").
 * Cada um deles é tratado por `FiscalManager` retornando `events: []`, nunca um Evento inventado —
 * mesmo padrão de `CreateProductionOrder`/`CreateWorkCenter` em
 * `packages/production-hub/src/ProductionCommand.ts`. Detalhado em
 * `IMP_601_FISCAL_HUB_CORE_REPORT.md`, Seção "Divergências Encontradas".
 */
export type FiscalCommandType =
  | 'RegisterTaxRegime'
  | 'CreateTaxRule'
  | 'DeactivateTaxRule'
  | 'CalculateTax'
  | 'IssueFiscalDocument'
  | 'CancelFiscalDocument'
  | 'RegisterFiscalObligation'
  | 'MarkFiscalObligationFulfilled';

export interface FiscalCommand {
  /** Identificador de operação, único por execução — garante Idempotência. */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: FiscalCommandType;

  /** Momento em que o Comando foi recebido pelo FiscalManager. */
  readonly requestedAt: Date;
}
