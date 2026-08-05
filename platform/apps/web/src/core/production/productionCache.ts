import type { QueryClient } from "@tanstack/react-query";
import { productionQueryKeys } from "./productionQueryKeys.js";
import type {
  BillOfMaterialsResponseDto,
  ProductionOrderResponseDto,
  SupersedeBillOfMaterialsResponseDto,
  WorkCenterResponseDto,
} from "./production.dto.js";

/**
 * Helpers de sincronização de cache do Production Hub — mesmo padrão de
 * `syncPurchaseOrderInCaches`/`syncStockReservationInCaches`/`syncSupplierInCaches`: grava o cache de
 * detalhe diretamente (`setQueryData`), e, quando uma lista já cacheada existir, substitui a entrada
 * correspondente ou a acrescenta. Nenhum `invalidateQueries`. Nenhuma estratégia nova inventada, per
 * instrução explícita desta Sprint ("Somente estratégias já existentes. Nunca inventar novas.").
 */

/** `BillOfMaterials` é uma Entidade versionada, nunca editada in-place (Core, IMP-501) — grava sempre
 * o cache de detalhe; quando `Active`, também grava `activeBillOfMaterialsByProduct` (sempre a versão
 * mais recente, nunca aditiva — mesmo formato de `syncStockPositionInCache`, que também é sempre a
 * projeção mais recente de um Produto). Uma `BillOfMaterials` `Superseded` nunca sobrescreve essa
 * chave — apenas a que está `Active` no momento da chamada. */
export function syncBillOfMaterialsInCache(queryClient: QueryClient, bom: BillOfMaterialsResponseDto): void {
  queryClient.setQueryData<BillOfMaterialsResponseDto>(productionQueryKeys.billOfMaterials(bom.billOfMaterialsId), bom);

  if (bom.status === "Active") {
    queryClient.setQueryData<BillOfMaterialsResponseDto>(productionQueryKeys.activeBillOfMaterialsByProduct(bom.outputProductId), bom);
  }
}

/** `SupersedeBillOfMaterialsResponseDto` carrega duas versões — sincroniza ambas; apenas `next`
 * (sempre `Active`) atualiza `activeBillOfMaterialsByProduct`, per `syncBillOfMaterialsInCache`. */
export function syncSupersedeBillOfMaterialsInCaches(queryClient: QueryClient, result: SupersedeBillOfMaterialsResponseDto): void {
  syncBillOfMaterialsInCache(queryClient, result.previous);
  syncBillOfMaterialsInCache(queryClient, result.next);
}

/**
 * `ProductionOrder` é uma Entidade mutável (`Planned → InProgress → Completed | Cancelled`) — grava
 * sempre o cache de detalhe; quando `orderId` está presente (Produção reativa a uma venda), substitui
 * ou acrescenta a entrada em `productionOrdersByOrigin`, mesma disciplina de
 * `syncStockReservationInCaches` para `reservationsByOrder` — `orderId` é imutável após a criação
 * (Core, IMP-501), portanto nunca sofre o mesmo problema descrito abaixo para `productionOrdersByStatus`.
 *
 * `ProductionConsumption`/`ProductionOutput` (embutidos em `order.consumptions`/`order.outputs`) não
 * exigem nenhuma sincronização própria — diferente de `StockMovement`/`Receiving` (Entidades com Query
 * de listagem dedicada, sincronizadas via `appendXInCache`), nenhuma Query independente existe para
 * eles em `apps/api/src/routes/production.ts` (IMP-503); ambos são campos do próprio
 * `ProductionOrder`, já corretos assim que este `setQueryData` grava o objeto completo devolvido pela
 * Mutation. Nenhuma estratégia "append-only" é aplicável ou necessária aqui — ver Seção "Auditoria" de
 * `IMP_504_PRODUCTION_FRONTEND_REPORT.md`.
 *
 * LIMITAÇÃO DOCUMENTADA, não corrigida — mesma classe de `requisitionsByStatus` (Purchase Hub,
 * IMP-304): `productionOrdersByStatus` nunca é sincronizada automaticamente. É chaveada pelo próprio
 * `status` mutável da Entidade — uma transição real (`Planned → InProgress`, `InProgress → Completed`)
 * deveria mover a entrada de uma chave de cache para outra, cenário para o qual nenhum padrão já
 * consolidado nesta plataforma (Supplier/Purchase/Inventory Movement) tem solução (IMP-304 nomeou o
 * helper `moveEntryBetweenKeyedLists` como candidato e explicitamente não o construiu, por só existir
 * um caso real até então). Como não existe padrão equivalente já consolidado, nenhuma estratégia foi
 * inventada aqui — o chamador (futuro Workspace, IMP-505) deve invalidar/refazer
 * `productionOrdersByStatus` manualmente após uma Mutation que altera `status`
 * (`useStartProduction`/`useCompleteProduction`/`useCancelProduction`), ou aceitar a lista desatualizada
 * até a próxima consulta real.
 */
export function syncProductionOrderInCaches(queryClient: QueryClient, order: ProductionOrderResponseDto): void {
  queryClient.setQueryData<ProductionOrderResponseDto>(productionQueryKeys.productionOrder(order.productionOrderId), order);

  if (order.orderId) {
    queryClient.setQueryData<readonly ProductionOrderResponseDto[]>(productionQueryKeys.productionOrdersByOrigin(order.orderId), (previous) => {
      if (!previous) {
        return previous;
      }

      const exists = previous.some((existing) => existing.productionOrderId === order.productionOrderId);
      return exists
        ? previous.map((existing) => (existing.productionOrderId === order.productionOrderId ? order : existing))
        : [...previous, order];
    });
  }
}

/** Acrescenta um novo Work Center à lista de ativos já cacheada — sempre aditiva (toda nova instância
 * nasce `active: true`, per `ProductionFactory.createWorkCenter`, Core), mesmo formato de
 * `appendStockLocationInCache`. Diferente deste, `GET /work-centers/active` (IMP-503) não recebe
 * `tenantId` — limitação já herdada do Core/Persistência/HTTP (IMP-501/502/503) — por isso
 * `activeWorkCenters()` não é parametrizada por Tenant aqui também, mesma ausência, nunca resolvida
 * silenciosamente nesta camada. */
export function appendWorkCenterInCache(queryClient: QueryClient, workCenter: WorkCenterResponseDto): void {
  queryClient.setQueryData<readonly WorkCenterResponseDto[]>(productionQueryKeys.activeWorkCenters(), (previous) =>
    previous ? [...previous, workCenter] : previous,
  );
}
