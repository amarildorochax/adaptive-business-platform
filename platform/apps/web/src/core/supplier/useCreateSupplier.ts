import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierClient } from "./supplierClient.js";
import { syncSupplierInCaches } from "./supplierCache.js";
import type { RegisterSupplierRequestDto } from "./supplier.dto.js";

/** Command "RegisterSupplier" (`POST /suppliers`, IMP-203). */
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterSupplierRequestDto) => supplierClient.register(payload),
    onSuccess: (supplier) => syncSupplierInCaches(queryClient, supplier),
  });
}
