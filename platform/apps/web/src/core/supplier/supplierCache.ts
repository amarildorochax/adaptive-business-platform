import type { QueryClient } from "@tanstack/react-query";
import { supplierQueryKeys } from "./supplierQueryKeys.js";
import type { SupplierResponseDto } from "./supplier.dto.js";

/**
 * Helper de sincronização de cache — reutilizado por toda Mutation cujo sucesso devolve um
 * `SupplierResponseDto` completo (`register`/`update`/`disable`/`reactivate`/`addContact`).
 * Atualiza o cache de detalhe (`supplierQueryKeys.detail`) diretamente, e, quando a lista do mesmo
 * Tenant já está em cache, substitui a entrada correspondente ou a acrescenta — nunca refaz a
 * consulta ao servidor quando o dado já retornado pela própria Mutation já é a fotografia completa
 * e correta, mesmo padrão de `useRegenerateTheme`/`useSubmitLogo` (Branding). Nenhum `invalidateQueries`
 * é chamado aqui — não é necessário, porque o dado retornado já é o estado real pós-Mutation.
 */
export function syncSupplierInCaches(queryClient: QueryClient, supplier: SupplierResponseDto): void {
  queryClient.setQueryData<SupplierResponseDto>(supplierQueryKeys.detail(supplier.supplierId), supplier);

  queryClient.setQueryData<readonly SupplierResponseDto[]>(supplierQueryKeys.list(supplier.tenantId), (previous) => {
    if (!previous) {
      return previous;
    }

    const exists = previous.some((existing) => existing.supplierId === supplier.supplierId);
    return exists ? previous.map((existing) => (existing.supplierId === supplier.supplierId ? supplier : existing)) : [...previous, supplier];
  });
}
