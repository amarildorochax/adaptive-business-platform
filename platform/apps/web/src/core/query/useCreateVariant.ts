import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useManagers } from "@core/managers/useManagers";

/** `CommerceManager.createVariant` real — nenhum Evento aprovado cobre Variant isoladamente (ver `CommerceEvent.ts`), então `events` é sempre `[]`. */
export function useCreateVariant() {
  const managers = useManagers();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, label }: { readonly productId: string; readonly label: string }) => managers.commerce.createVariant(productId, label),
    onSuccess: ({ result }) => {
      queryClient.setQueryData<ProductWorkspaceSnapshot>(["commerce", "workspace"], (previous) => (previous ? { ...previous, variants: [...previous.variants, result] } : previous));
    },
  });
}
