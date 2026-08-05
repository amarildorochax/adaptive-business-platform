import type { QueryClient } from "@tanstack/react-query";
import { purchaseQueryKeys } from "./purchaseQueryKeys.js";
import type { PurchaseOrderResponseDto, PurchaseRequisitionResponseDto, ReceivingResponseDto } from "./purchase.dto.js";

/**
 * Helpers de sincronização de cache do Purchase Hub — mesmo padrão de `syncSupplierInCaches`
 * (`supplierCache.ts`, IMP-204): grava o cache de detalhe diretamente (`setQueryData`), e, quando
 * uma lista já cacheada existir, substitui a entrada correspondente ou a acrescenta. Nenhum
 * `invalidateQueries` — o dado já devolvido pela própria Mutation já é o estado real pós-operação,
 * mesma justificativa de IMP-204. Nenhuma estratégia nova inventada, per instrução explícita de
 * IMP-304 ("Somente utilizar padrões já consolidados. Não inventar").
 */
export function syncPurchaseOrderInCaches(queryClient: QueryClient, purchaseOrder: PurchaseOrderResponseDto): void {
  queryClient.setQueryData<PurchaseOrderResponseDto>(purchaseQueryKeys.order(purchaseOrder.purchaseOrderId), purchaseOrder);

  queryClient.setQueryData<readonly PurchaseOrderResponseDto[]>(purchaseQueryKeys.openOrdersByTenant(purchaseOrder.tenantId), (previous) =>
    replaceOrAppend(previous, purchaseOrder, (candidate) => candidate.purchaseOrderId === purchaseOrder.purchaseOrderId),
  );

  queryClient.setQueryData<readonly PurchaseOrderResponseDto[]>(purchaseQueryKeys.ordersBySupplier(purchaseOrder.supplierId), (previous) =>
    replaceOrAppend(previous, purchaseOrder, (candidate) => candidate.purchaseOrderId === purchaseOrder.purchaseOrderId),
  );
}

/**
 * `openOrdersByTenant` nunca remove uma entrada quando o Purchase Order sai do conjunto "aberto"
 * (`Received`/`Cancelled`) — mesma limitação já aceita por `syncSupplierInCaches` para
 * `listActiveSuppliers` (um Supplier desabilitado permanece na lista "ativa" em cache até a próxima
 * consulta real ao servidor). Não corrigida aqui — seguir fielmente o padrão já consolidado, nunca
 * inventar uma estratégia de remoção que o Supplier Hub também não tem.
 */
function replaceOrAppend<T>(previous: readonly T[] | undefined, item: T, matches: (candidate: T) => boolean): readonly T[] | undefined {
  if (!previous) {
    return previous;
  }

  return previous.some(matches) ? previous.map((candidate) => (matches(candidate) ? item : candidate)) : [...previous, item];
}

/**
 * Sincroniza apenas o cache de detalhe da Requisition — nunca uma lista por status
 * (`requisitionsByStatus`). LIMITAÇÃO DOCUMENTADA, não corrigida: diferente de `openOrdersByTenant`/
 * `ordersBySupplier` (uma única chave por Tenant/Fornecedor, o mesmo formato de lista único que
 * `syncSupplierInCaches` já resolve), `requisitionsByStatus` é chaveada também pelo próprio `status`
 * — uma transição real (`Open` → `Approved`) deveria mover a entrada de uma chave de cache para
 * outra, um cenário que nenhum Hook já existente no Supplier Hub jamais precisou resolver (nenhuma
 * lista do Supplier Hub é chaveada por um campo mutável da própria Entidade). Como não existe padrão
 * equivalente já consolidado, nenhuma estratégia foi inventada — o chamador (futuro Workspace,
 * IMP-305) deve invalidar/refazer `requisitionsByStatus` manualmente após uma Mutation que altera
 * `status`, ou aceitar a lista desatualizada até a próxima consulta real. Documentado em
 * `IMP_304_PURCHASE_FRONTEND_REPORT.md`.
 */
export function syncPurchaseRequisitionInCaches(queryClient: QueryClient, requisition: PurchaseRequisitionResponseDto): void {
  queryClient.setQueryData<PurchaseRequisitionResponseDto>(purchaseQueryKeys.requisition(requisition.requisitionId), requisition);
}

/** Acrescenta um novo Receiving à lista já cacheada do mesmo Purchase Order — sempre aditivo, nunca substitui (Receiving é imutável, per Core), mesmo formato de lista de chave única já usado por `openOrdersByTenant`. */
export function appendReceivingInCache(queryClient: QueryClient, purchaseOrderId: string, receiving: ReceivingResponseDto): void {
  queryClient.setQueryData<readonly ReceivingResponseDto[]>(purchaseQueryKeys.receivings(purchaseOrderId), (previous) =>
    previous ? [...previous, receiving] : previous,
  );
}
