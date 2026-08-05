import { useQuery } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { productionQueryKeys } from "./productionQueryKeys.js";

/**
 * Soma do `acquisitionCost` de todo insumo já consumido em uma ProductionOrder
 * (`GET /production-orders/:productionOrderId/total-consumed-cost`, IMP-503) — única consolidação de
 * custo permitida a este Hub (`PRODUCTION_HUB.md`, Capítulo 3).
 *
 * Diferente de `useBillOfMaterials`/`useProductionOrder`, este Hook NUNCA trata 404 como estado
 * legítimo (`productionClient.getTotalConsumedCost` não usa `undefinedOn404` — ver
 * `productionClient.ts`) — um `productionOrderId` inválido é um erro real, propagado normalmente via
 * `isError`.
 *
 * LIMITAÇÃO DOCUMENTADA — mesma classe de `productionOrdersByStatus` (dado que se torna desatualizado
 * após uma Mutation relacionada, sem estratégia de sincronização automática já consolidada nesta
 * plataforma): `useRegisterProductionConsumption`/`useCompleteProduction` alteram o total real, mas
 * nenhum Hook de Mutation atualiza o cache desta Query — recalcular o valor no cliente reproduziria a
 * regra de negócio "soma do acquisitionCost dos insumos consumidos" (`PRODUCTION_HUB.md`, Capítulo 3)
 * fora do Core, violando a regra final desta Sprint ("Nenhuma regra de negócio"). Documentado em
 * `IMP_504_PRODUCTION_FRONTEND_REPORT.md`.
 */
export function useTotalConsumedCost(productionOrderId: string | undefined) {
  return useQuery({
    queryKey: productionQueryKeys.totalConsumedCost(productionOrderId ?? ""),
    queryFn: () => {
      if (!productionOrderId) {
        throw new Error("productionOrderId ausente.");
      }
      return productionClient.getTotalConsumedCost(productionOrderId);
    },
    enabled: productionOrderId !== undefined,
  });
}
