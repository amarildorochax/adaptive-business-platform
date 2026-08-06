import type { QueryClient } from "@tanstack/react-query";
import { fiscalQueryKeys } from "./fiscalQueryKeys.js";
import type { FiscalDocumentResponseDto, FiscalObligationResponseDto, TaxRegimeResponseDto, TaxRuleResponseDto } from "./fiscal.dto.js";

/**
 * Helpers de sincronização de cache do Fiscal Hub — mesmo padrão de `syncProductionOrderInCaches`/
 * `syncPurchaseOrderInCaches`/`syncStockReservationInCaches`/`syncSupplierInCaches`: grava o cache de
 * detalhe diretamente (`setQueryData`), e, quando uma lista já cacheada existir, substitui a entrada
 * correspondente ou a acrescenta. Nenhum `invalidateQueries`. Nenhuma estratégia nova inventada, per
 * instrução explícita desta Sprint ("Reutilizar apenas estratégias de cache já existentes. Nunca
 * inventar nova estratégia se uma existente resolver.").
 *
 * AUDITORIA DAS CINCO ESTRATÉGIAS JÁ CATALOGADAS (Supplier/Purchase/Inventory Movement/Production):
 *
 * 1. Substituição direta de detalhe (`setQueryData`) — reutilizada por `syncTaxRegimeInCache`,
 *    `syncTaxRuleInCache`, `syncFiscalDocumentInCaches` (parte "detalhe").
 * 2. Replace-or-append em lista de chave imutável — reutilizada por `syncFiscalDocumentInCaches`
 *    (`fiscalDocumentsByOrigin`, chaveada por `orderId`, imutável após a criação per Core).
 * 3. Aditiva (append-only) — reutilizada por `appendPendingFiscalObligationInCache`
 *    (`pendingFiscalObligations`, toda nova instância nasce `Pending`, mesmo formato de
 *    `appendWorkCenterInCache`/`appendStockLocationInCache`).
 * 4. Sem sincronização de lista (chave mutável, sem estratégia consolidada) — aplica-se a
 *    `pendingFiscalObligations`/`overdueFiscalObligations` diante de `fulfillFiscalObligation`/
 *    `evaluateFiscalObligations` (ver nota em `useFulfillFiscalObligation.ts`/
 *    `useEvaluateFiscalObligations.ts`).
 * 5. Sem sincronização alguma (Mutation sem Query correspondente) — aplica-se a `calculateTax`
 *    (nenhum `GET` existe para `TaxCalculation` em nenhuma camada) e a `deactivateTaxRule` quanto a
 *    qualquer lista (nenhuma Query de listagem existe para `TaxRule`).
 *
 * Nenhuma estratégia nova foi necessária — as cinco já catalogadas cobrem integralmente a superfície do
 * Fiscal Hub.
 */

/** `TaxRegime` nunca é atualizado após o registro (Core, IMP-601: nenhum Command além de
 * `RegisterTaxRegime` o altera) — grava sempre o cache de detalhe, chaveado por `tenantId` (imutável).
 * Nenhuma lista existe (`GET /tax-regimes` não é uma Query exposta, apenas `GET /tax-regimes/:tenantId`),
 * portanto nenhuma sincronização adicional é possível ou necessária. */
export function syncTaxRegimeInCache(queryClient: QueryClient, regime: TaxRegimeResponseDto): void {
  queryClient.setQueryData<TaxRegimeResponseDto>(fiscalQueryKeys.taxRegimeByTenant(regime.tenantId), regime);
}

/** `TaxRule` é mutável (`active: true → false`, via `DeactivateTaxRule`) — grava sempre o cache de
 * detalhe. Diferente de `WorkCenter` (Production Hub), nenhuma Query de listagem (`GET /tax-rules`)
 * existe em `apps/api/src/routes/fiscal.ts` (IMP-603) — apenas `GET /tax-rules/:taxRuleId` — portanto
 * nenhum helper `appendXInCache`/lista é sequer aplicável aqui, estratégia 5 por ausência estrutural de
 * Query, mesmo critério de `syncPurchaseRequisitionInCaches` (Purchase Hub) para `requisitionsByStatus`
 * — mas ainda mais simples: não há lista alguma para sequer ficar desatualizada. */
export function syncTaxRuleInCache(queryClient: QueryClient, rule: TaxRuleResponseDto): void {
  queryClient.setQueryData<TaxRuleResponseDto>(fiscalQueryKeys.taxRule(rule.taxRuleId), rule);
}

/**
 * `FiscalDocument` é mutável (`Issued → Cancelled`, via `CancelFiscalDocument`) — grava sempre o cache
 * de detalhe; quando `orderId` está presente (documento rastreável a uma venda), substitui ou acrescenta
 * a entrada em `fiscalDocumentsByOrigin`, mesma disciplina de `syncProductionOrderInCaches` para
 * `productionOrdersByOrigin`/`syncStockReservationInCaches` para `reservationsByOrder` — `orderId` é
 * imutável após a emissão (Core, IMP-601), portanto nunca sofre o problema de chave mutável descrito
 * abaixo para as listas de Fiscal Obligation.
 *
 * Diferente de `ProductionOrder` (`productionOrdersByStatus`), nenhuma Query "by-status" existe para
 * `FiscalDocument` em `apps/api/src/routes/fiscal.ts` — apenas `by-origin` — portanto `FiscalDocument`
 * não sofre a limitação de "chave mutável sem estratégia consolidada" que `ProductionOrder`/
 * `PurchaseRequisition` sofrem; a única lista existente (`fiscalDocumentsByOrigin`) é chaveada por um
 * campo imutável, coberta integralmente pela estratégia 2.
 */
export function syncFiscalDocumentInCaches(queryClient: QueryClient, document: FiscalDocumentResponseDto): void {
  queryClient.setQueryData<FiscalDocumentResponseDto>(fiscalQueryKeys.fiscalDocument(document.fiscalDocumentId), document);

  if (document.orderId) {
    queryClient.setQueryData<readonly FiscalDocumentResponseDto[]>(fiscalQueryKeys.fiscalDocumentsByOrigin(document.orderId), (previous) => {
      if (!previous) {
        return previous;
      }

      const exists = previous.some((existing) => existing.fiscalDocumentId === document.fiscalDocumentId);
      return exists
        ? previous.map((existing) => (existing.fiscalDocumentId === document.fiscalDocumentId ? document : existing))
        : [...previous, document];
    });
  }
}

/**
 * Acrescenta uma nova Fiscal Obligation à lista `pending` já cacheada — sempre aditiva (toda nova
 * instância nasce `Pending`, per `FiscalFactory.createFiscalObligation`, Core), mesmo formato de
 * `appendWorkCenterInCache`/`appendStockLocationInCache`. Usado exclusivamente por
 * `useRegisterFiscalObligation` — `fulfillFiscalObligation`/`evaluateFiscalObligations` nunca chamam
 * este helper (ver limitação documentada abaixo).
 *
 * LIMITAÇÃO DOCUMENTADA, não corrigida — nenhum helper de remoção/movimentação entre
 * `pendingFiscalObligations`/`overdueFiscalObligations` existe nesta plataforma: diferente de
 * `productionOrdersByStatus`/`requisitionsByStatus` (uma única chave parametrizada por status,
 * simplesmente nunca sincronizada), o Fiscal Hub expõe DUAS chaves fixas e independentes
 * (`pending`/`overdue`); uma transição real de `FiscalObligation` (`Pending → Fulfilled`,
 * `Pending → Overdue`, `Overdue → Fulfilled`) precisaria REMOVER a entrada de uma lista — uma classe de
 * problema mais difícil que "mover entre chaves parametrizadas", nunca resolvida por nenhum Hub
 * anterior (confirmado por auditoria desta Sprint: nenhum arquivo `*Cache.ts` do workspace usa
 * `.filter()` para remover uma entrada de uma lista em cache). Como não existe estratégia de remoção já
 * consolidada, nenhuma foi inventada aqui, per instrução explícita desta Sprint. O chamador (futuro
 * Workspace) deve invalidar/refazer `pendingFiscalObligations`/`overdueFiscalObligations` manualmente
 * após `useFulfillFiscalObligation`/`useEvaluateFiscalObligations`, ou aceitar as listas desatualizadas
 * até a próxima consulta real.
 */
export function appendPendingFiscalObligationInCache(queryClient: QueryClient, obligation: FiscalObligationResponseDto): void {
  queryClient.setQueryData<readonly FiscalObligationResponseDto[]>(fiscalQueryKeys.pendingFiscalObligations(), (previous) =>
    previous ? [...previous, obligation] : previous,
  );
}
