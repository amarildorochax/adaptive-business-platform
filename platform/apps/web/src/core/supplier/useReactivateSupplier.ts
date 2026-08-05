import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierClient } from "./supplierClient.js";
import { syncSupplierInCaches } from "./supplierCache.js";

/** Command "ReactivateSupplier" (`POST /suppliers/:supplierId/reactivate`, IMP-203). */
export function useReactivateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplierId: string) => supplierClient.reactivate(supplierId),
    onSuccess: (supplier) => syncSupplierInCaches(queryClient, supplier),
  });
}
