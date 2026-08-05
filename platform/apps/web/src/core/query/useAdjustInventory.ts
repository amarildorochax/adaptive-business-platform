import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toLogEntry, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useManagers } from "@core/managers/useManagers";

/** `CommerceManager.adjustInventory` real (Evento `StockUpdated`) — substitui o Inventory correspondente já em cache (mesmo Product/Variant) ou o acrescenta, quando ainda não existia. */
export function useAdjustInventory() {
  const managers = useManagers();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, delta, variantId }: { readonly productId: string; readonly delta: number; readonly variantId?: string }) => managers.commerce.adjustInventory(productId, delta, variantId),
    onSuccess: ({ result, events }, variables) => {
      queryClient.setQueryData<ProductWorkspaceSnapshot>(["commerce", "workspace"], (previous) => {
        if (!previous) {
          return previous;
        }
        const exists = previous.inventory.some((entry) => entry.inventoryId === result.inventoryId);
        const inventory = exists ? previous.inventory.map((entry) => (entry.inventoryId === result.inventoryId ? result : entry)) : [...previous.inventory, result];
        return { ...previous, inventory, eventLog: [...previous.eventLog, ...events.map((event) => toLogEntry(event, { delta: variables.delta, productId: result.productId }))] };
      });
    },
  });
}
