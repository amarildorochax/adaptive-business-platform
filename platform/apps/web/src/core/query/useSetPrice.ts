import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SetPriceInput } from "@abp/commerce-hub";
import { toLogEntry, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useManagers } from "@core/managers/useManagers";

/** `CommerceManager.setPrice` real (Evento `PriceChanged`) — acrescenta o novo Price ao Product Hub Workspace; `resolveCurrentPrice` sempre lê o mais recente. */
export function useSetPrice() {
  const managers = useManagers();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetPriceInput) => managers.commerce.setPrice(input),
    onSuccess: ({ result, events }) => {
      queryClient.setQueryData<ProductWorkspaceSnapshot>(["commerce", "workspace"], (previous) =>
        previous ? { ...previous, prices: [...previous.prices, result], eventLog: [...previous.eventLog, ...events.map((event) => toLogEntry(event, { productId: result.productId }))] } : previous,
      );
    },
  });
}
