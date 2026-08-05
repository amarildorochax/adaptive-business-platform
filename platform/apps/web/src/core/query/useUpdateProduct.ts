import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateProductInput } from "@abp/commerce-hub";
import { toLogEntry, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useManagers } from "@core/managers/useManagers";

/** `CommerceManager.updateProduct` real — substitui o Product correspondente já em cache. Nunca altera `status` — `CreateProductInput` (aceito por `update`) não inclui esse campo; ver limitação documentada no relatório desta Sprint. */
export function useUpdateProduct() {
  const managers = useManagers();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, input }: { readonly productId: string; readonly input: Partial<CreateProductInput> }) => managers.commerce.updateProduct(productId, input),
    onSuccess: ({ result, events }) => {
      queryClient.setQueryData<ProductWorkspaceSnapshot>(["commerce", "workspace"], (previous) =>
        previous
          ? { ...previous, products: previous.products.map((existing) => (existing.productId === result.productId ? result : existing)), eventLog: [...previous.eventLog, ...events.map((event) => toLogEntry(event, { productId: result.productId }))] }
          : previous,
      );
    },
  });
}
