import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierClient } from "./supplierClient.js";
import { syncSupplierInCaches } from "./supplierCache.js";

/**
 * Command "DisableSupplier" (`POST /suppliers/:supplierId/disable`, IMP-203).
 *
 * IMP-204 cita "useDeactivateSupplier()" como exemplo de nome — mas todo o vocabulário já
 * consolidado do Supplier Hub, do Core (IMP-201: `disableSupplier`, `SupplierStatus = "Active" |
 * "Disabled"`) à Persistência (IMP-202) ao HTTP (IMP-203: `POST /suppliers/:supplierId/disable`,
 * Evento `SupplierDisabled`), usa exclusivamente "Disable"/"Disabled" — "Deactivate" não aparece em
 * nenhum documento ou código já aprovado. A própria Sprint introduz a lista sob "Exemplos:", não
 * como nomes obrigatórios; nomeado aqui `useDisableSupplier` para preservar a mesma Linguagem
 * Ubíqua já fixada nas três Sprints anteriores, evitando introduzir um segundo sinônimo não
 * documentado em nenhum lugar.
 */
export function useDisableSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplierId: string) => supplierClient.disable(supplierId),
    onSuccess: (supplier) => syncSupplierInCaches(queryClient, supplier),
  });
}
