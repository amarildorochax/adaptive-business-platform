/**
 * Query Keys do Fiscal Hub — mesma disciplina de centralização de `productionQueryKeys.ts`/
 * `inventoryMovementQueryKeys.ts`/`purchaseQueryKeys.ts`/`supplierQueryKeys.ts`. Seis chaves, uma por
 * Query exposta em `apps/api/src/routes/fiscal.ts` (IMP-603) — nenhuma para `TaxCalculation` (nenhum
 * `GET` existe para ela em nenhuma camada, nem Repository no Core) e nenhuma para `FiscalObligation`
 * por identificador (nenhum `GET /fiscal-obligations/:id` existe — apenas as duas listas `pending`/
 * `overdue`), mesmo critério já usado para `ProductionConsumption`/`ProductionOutput` (Production Hub).
 */
export const fiscalQueryKeys = {
  taxRegimeByTenant: (tenantId: string) => ["fiscal", "tax-regime", tenantId] as const,
  taxRule: (taxRuleId: string) => ["fiscal", "tax-rule", taxRuleId] as const,
  fiscalDocument: (fiscalDocumentId: string) => ["fiscal", "fiscal-document", fiscalDocumentId] as const,
  fiscalDocumentsByOrigin: (orderId: string) => ["fiscal", "fiscal-documents", "by-origin", orderId] as const,
  pendingFiscalObligations: () => ["fiscal", "fiscal-obligations", "pending"] as const,
  overdueFiscalObligations: () => ["fiscal", "fiscal-obligations", "overdue"] as const,
};
