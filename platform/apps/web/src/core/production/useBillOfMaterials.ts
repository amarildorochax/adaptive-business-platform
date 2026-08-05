import { useQuery } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { productionQueryKeys } from "./productionQueryKeys.js";

/**
 * Localiza uma BillOfMaterials por identificador (`GET /bills-of-materials/:billOfMaterialsId`,
 * IMP-503) — `undefined` quando ausente, nunca um erro. `queryFn` nunca resolve para `undefined`
 * diretamente — React Query v5 trata isso como erro ("Query data cannot be undefined"), mesmo bug
 * documentado por `useSupplier.ts` (IMP-204): `null` é o sentinela interno, `select` o converte de
 * volta para `undefined`.
 */
export function useBillOfMaterials(billOfMaterialsId: string | undefined) {
  return useQuery({
    queryKey: productionQueryKeys.billOfMaterials(billOfMaterialsId ?? ""),
    queryFn: async () => {
      if (!billOfMaterialsId) {
        throw new Error("billOfMaterialsId ausente.");
      }
      return (await productionClient.findBillOfMaterialsById(billOfMaterialsId)) ?? null;
    },
    select: (data) => data ?? undefined,
    enabled: billOfMaterialsId !== undefined,
  });
}
