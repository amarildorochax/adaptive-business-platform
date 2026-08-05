import { useMutation } from "@tanstack/react-query";
import { supplierClient } from "./supplierClient.js";
import type { RegisterSupplierCatalogItemRequestDto } from "./supplier.dto.js";

/**
 * Command "RegisterSupplierCatalogItem" (`POST /supplier-catalog-items`, IMP-203). Sem
 * sincronização de cache — nenhuma Query de listagem de Catalog Item existe ainda nesta camada
 * (IMP-203 não expõe nenhum `GET` para este recurso; `SupplierManager` não tem Query
 * correspondente). Nenhum padrão de cache é inventado aqui — o chamador (IMP-205, Workspace)
 * decide o que fazer com o resultado via seu próprio `onSuccess`.
 */
export function useRegisterSupplierCatalogItem() {
  return useMutation({
    mutationFn: (payload: RegisterSupplierCatalogItemRequestDto) => supplierClient.registerCatalogItem(payload),
  });
}
