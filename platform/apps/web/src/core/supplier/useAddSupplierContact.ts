import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierClient } from "./supplierClient.js";
import { syncSupplierInCaches } from "./supplierCache.js";
import type { AddSupplierContactRequestDto } from "./supplier.dto.js";

/** Command "AddSupplierContact" (`POST /suppliers/:supplierId/contacts`, IMP-203). */
export function useAddSupplierContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ supplierId, payload }: { readonly supplierId: string; readonly payload: AddSupplierContactRequestDto }) =>
      supplierClient.addContact(supplierId, payload),
    onSuccess: (supplier) => syncSupplierInCaches(queryClient, supplier),
  });
}
