import { useQuery } from "@tanstack/react-query";
import { supplierClient } from "./supplierClient.js";
import { supplierQueryKeys } from "./supplierQueryKeys.js";

/**
 * Localiza um Supplier por identificador (`GET /suppliers/:supplierId`, IMP-203) — `undefined`
 * quando ausente, nunca um erro (mesma disciplina de `undefinedOn404`).
 *
 * `queryFn` nunca resolve para `undefined` diretamente — React Query v5 trata isso como erro
 * ("Query data cannot be undefined"), descoberto por este próprio teste de Hook (`useSupplierQueries.test.tsx`,
 * "404 tratado como ausência"), nunca reproduzido pelos testes já existentes de
 * `useBusinessProfile`/`useBrandIdentity` porque nenhum deles tem teste de Hook próprio cobrindo
 * esse caminho — mesma forma de ausência (`T | undefined`), mesma exposição ao risco, apenas nunca
 * testada. `null` é o sentinela interno aceito por React Query; `select` o converte de volta para
 * `undefined`, preservando o contrato já usado em toda a aplicação (`T | undefined`, nunca `T |
 * null`).
 */
export function useSupplier(supplierId: string | undefined) {
  return useQuery({
    queryKey: supplierQueryKeys.detail(supplierId ?? ""),
    queryFn: async () => {
      if (!supplierId) {
        throw new Error("supplierId ausente.");
      }
      return (await supplierClient.findById(supplierId)) ?? null;
    },
    select: (data) => data ?? undefined,
    enabled: supplierId !== undefined,
  });
}
