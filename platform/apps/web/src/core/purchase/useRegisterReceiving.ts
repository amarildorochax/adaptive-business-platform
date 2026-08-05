import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseClient } from "./purchaseClient.js";
import { appendReceivingInCache, syncPurchaseOrderInCaches } from "./purchaseCache.js";
import type { RegisterReceivingRequestDto } from "./purchase.dto.js";

/**
 * Command "RegisterReceiving" (`POST /receivings`, IMP-303). Sincroniza tanto o Purchase Order
 * embutido no resultado composto (`RegisterReceivingResponseDto.purchaseOrder`) quanto a lista de
 * Receivings já cacheada para o mesmo Purchase Order.
 *
 * LIMITAÇÃO CONHECIDA, per instrução explícita de IMP-304 — este Hook NUNCA simula, mascara ou
 * contorna a limitação documentada em `IMP_303_PURCHASE_HTTP_API_REPORT.md`, Capítulo 8: um segundo
 * `registerReceiving` contra o mesmo Purchase Order falha com um erro real do servidor (`ApiError`,
 * statusCode 500 — bug de Persistência em `SqlitePurchaseOrderRepository.replaceItems`, IMP-302,
 * ainda não corrigido). Este Hook não tenta detectar, prevenir ou repetir essa chamada — o erro
 * propaga normalmente para o chamador via `onError`/`isError`, exatamente como qualquer outro erro
 * HTTP. Nenhum workaround é permitido nesta camada; cabe ao futuro Workspace (IMP-305) decidir como
 * comunicar essa limitação ao usuário final.
 */
export function useRegisterReceiving() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterReceivingRequestDto) => purchaseClient.registerReceiving(payload),
    onSuccess: (registration) => {
      syncPurchaseOrderInCaches(queryClient, registration.purchaseOrder);
      appendReceivingInCache(queryClient, registration.purchaseOrder.purchaseOrderId, registration.receiving);
    },
  });
}
