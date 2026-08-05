import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useManagers } from "@core/managers/useManagers";

/** `CommerceManager.createCategory` real — nenhum Evento aprovado cobre Category (ver `CommerceEvent.ts`), então `events` é sempre `[]`. */
export function useCreateCategory() {
  const managers = useManagers();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, name, parentCategoryId }: { readonly tenantId: string; readonly name: string; readonly parentCategoryId?: string }) => managers.commerce.createCategory(tenantId, name, parentCategoryId),
    onSuccess: ({ result }) => {
      queryClient.setQueryData<ProductWorkspaceSnapshot>(["commerce", "workspace"], (previous) => (previous ? { ...previous, categories: [...previous.categories, result] } : previous));
    },
  });
}
