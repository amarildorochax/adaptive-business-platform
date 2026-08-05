import { useQuery } from "@tanstack/react-query";
import { buildInitialProductWorkspace } from "@core/commerce/productWorkspace";
import { useDashboardBootstrap } from "./useDashboardBootstrap";

/**
 * Fonte única do Product Hub Workspace (FUN-104) — semeada uma única vez a partir do bootstrap da
 * sessão (`seedDemoData`) e, a partir daí, mantida exclusivamente pelo patch de cache de cada
 * mutação real (`useCreateProduct`/`useUpdateProduct`/`useCreateVariant`/`useCreateCategory`/
 * `useSetPrice`/`useAdjustInventory`) — nunca refeita do zero (`staleTime: Infinity`), porque não
 * existe nenhuma Query real para "atualizar" contra (`CommerceManager` não expõe nenhuma leitura em
 * lista, ver `core/commerce/productWorkspace.ts`). Mesmo padrão já estabelecido por
 * `useCrmWorkspace` (FUN-103).
 */
export function useProductWorkspace() {
  const bootstrap = useDashboardBootstrap();

  return useQuery({
    queryKey: ["commerce", "workspace"],
    queryFn: () => buildInitialProductWorkspace(bootstrap.data!),
    enabled: bootstrap.data !== undefined,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}
