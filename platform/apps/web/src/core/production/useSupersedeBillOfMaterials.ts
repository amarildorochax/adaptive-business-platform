import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productionClient } from "./productionClient.js";
import { syncSupersedeBillOfMaterialsInCaches } from "./productionCache.js";
import type { SupersedeBillOfMaterialsRequestDto } from "./production.dto.js";

/** Command "SupersedeBillOfMaterials" (`POST /bills-of-materials/:billOfMaterialsId/supersede`, IMP-503). */
export function useSupersedeBillOfMaterials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ billOfMaterialsId, payload }: { readonly billOfMaterialsId: string; readonly payload: SupersedeBillOfMaterialsRequestDto }) =>
      productionClient.supersedeBillOfMaterials(billOfMaterialsId, payload),
    onSuccess: (result) => syncSupersedeBillOfMaterialsInCaches(queryClient, result),
  });
}
