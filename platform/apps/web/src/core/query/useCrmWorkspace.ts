import { useQuery } from "@tanstack/react-query";
import { buildInitialCrmWorkspace } from "@core/crm/crmWorkspace";
import { useDashboardBootstrap } from "./useDashboardBootstrap";

/**
 * Fonte única do CRM Workspace (FUN-103) — semeada uma única vez a partir do bootstrap da sessão
 * (`seedDemoData`) e, a partir daí, mantida exclusivamente pelo patch de cache de cada mutação real
 * (`useCreateLead`/`useConvertLead`/`useCreateCustomer`/`useUpdateCustomer`/`useCreateOrganization`/
 * `useCreateContact`/`useCreateOpportunity`/`useMoveOpportunity`) — nunca refeita do zero (`staleTime:
 * Infinity`), porque não existe nenhuma Query real para "atualizar" contra (`CRMManager` não expõe
 * nenhuma leitura em lista, ver `core/crm/crmWorkspace.ts`).
 */
export function useCrmWorkspace() {
  const bootstrap = useDashboardBootstrap();

  return useQuery({
    queryKey: ["crm", "workspace"],
    queryFn: () => buildInitialCrmWorkspace(bootstrap.data!),
    enabled: bootstrap.data !== undefined,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}
