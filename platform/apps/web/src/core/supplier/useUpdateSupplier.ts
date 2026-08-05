import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierClient } from "./supplierClient.js";
import { syncSupplierInCaches } from "./supplierCache.js";
import type { UpdateSupplierRequestDto } from "./supplier.dto.js";

/** Command "UpdateSupplier" (`PATCH /suppliers/:supplierId`, IMP-203). */
export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ supplierId, payload }: { readonly supplierId: string; readonly payload: UpdateSupplierRequestDto }) =>
      supplierClient.update(supplierId, payload),
    onSuccess: (supplier) => syncSupplierInCaches(queryClient, supplier),
  });
}
