import { useMutation } from "@tanstack/react-query";
import { supplierClient } from "./supplierClient.js";
import type { UpdateSupplierCatalogItemRequestDto } from "./supplier.dto.js";

/** Command "UpdateSupplierCatalogItem" (`PATCH /supplier-catalog-items/:catalogItemId`, IMP-203). Sem sincronização de cache — mesma razão de `useRegisterSupplierCatalogItem`. */
export function useUpdateSupplierCatalogItem() {
  return useMutation({
    mutationFn: ({ catalogItemId, payload }: { readonly catalogItemId: string; readonly payload: UpdateSupplierCatalogItemRequestDto }) =>
      supplierClient.updateCatalogItem(catalogItemId, payload),
  });
}
