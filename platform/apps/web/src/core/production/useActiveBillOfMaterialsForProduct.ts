import { useQuery } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { productionQueryKeys } from "./productionQueryKeys.js";

/**
 * Localiza a BillOfMaterials Active corrente de um Produto final
 * (`GET /bills-of-materials/by-product/:outputProductId/active`, IMP-503) — `undefined` quando o
 * Produto ainda não possui nenhuma composição ativa, nunca um erro. Mesmo padrão `null`/`select` de
 * `useBillOfMaterials.ts`.
 */
export function useActiveBillOfMaterialsForProduct(outputProductId: string | undefined) {
  return useQuery({
    queryKey: productionQueryKeys.activeBillOfMaterialsByProduct(outputProductId ?? ""),
    queryFn: async () => {
      if (!outputProductId) {
        throw new Error("outputProductId ausente.");
      }
      return (await productionClient.findActiveBillOfMaterialsForProduct(outputProductId)) ?? null;
    },
    select: (data) => data ?? undefined,
    enabled: outputProductId !== undefined,
  });
}
