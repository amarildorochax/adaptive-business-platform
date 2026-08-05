import { useMutation } from "@tanstack/react-query";
import { supplierClient } from "./supplierClient.js";
import type { CreateSupplierContractRequestDto } from "./supplier.dto.js";

/** Command "CreateSupplierContract" (`POST /supplier-contracts`, IMP-203). Sem sincronização de cache — nenhuma Query de listagem de Contract existe ainda nesta camada, mesma razão de `useRegisterSupplierCatalogItem`. */
export function useCreateSupplierContract() {
  return useMutation({
    mutationFn: (payload: CreateSupplierContractRequestDto) => supplierClient.createContract(payload),
  });
}
