import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateProductInput } from "@abp/commerce-hub";
import { toLogEntry, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useManagers } from "@core/managers/useManagers";

/** `CommerceManager.createProduct` real — acrescenta o Product devolvido (e o Evento real `ProductCreated`) ao Product Hub Workspace em cache. */
export function useCreateProduct() {
  const managers = useManagers();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => managers.commerce.createProduct(input),
    onSuccess: ({ result, events }) => {
      queryClient.setQueryData<ProductWorkspaceSnapshot>(["commerce", "workspace"], (previous) =>
        previous ? { ...previous, products: [...previous.products, result], eventLog: [...previous.eventLog, ...events.map((event) => toLogEntry(event, { productId: result.productId }))] } : previous,
      );
    },
  });
}
