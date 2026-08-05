import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { syncBillOfMaterialsInCache } from "./productionCache.js";
import type { CreateBillOfMaterialsRequestDto } from "./production.dto.js";

/** Command "CreateBillOfMaterials" (`POST /bills-of-materials`, IMP-503). */
export function useCreateBillOfMaterials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBillOfMaterialsRequestDto) => productionClient.createBillOfMaterials(payload),
    onSuccess: (bom) => syncBillOfMaterialsInCache(queryClient, bom),
  });
}
