import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmLogEntry, type CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";
import { crmClient } from "@core/http/clients/crmClient";

/**
 * Command "ConvertLead" real (`POST /crm/leads/:leadId/convert`) — cria o Customer e o Relationship
 * resultantes, mantidos no CRM Workspace. O Lead original nunca é removido do Workspace local (a API
 * também nunca o remove/arquiva de fato — apenas para de ser referenciado por Opportunity futura, per
 * `CRM_HUB.md`) — apenas marcado em `convertedLeadIds`, uma memória puramente local desta sessão.
 */
export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, accountManagerId }: { readonly leadId: string; readonly accountManagerId: string }) => crmClient.convertLead(leadId, { accountManagerId }),
    onSuccess: ({ customer, relationship }, variables) => {
      queryClient.setQueryData<CrmWorkspaceSnapshot>(["crm", "workspace"], (previous) =>
        previous
          ? {
              ...previous,
              customers: [...previous.customers, customer],
              relationships: [...previous.relationships, relationship],
              convertedLeadIds: [...previous.convertedLeadIds, variables.leadId],
              activityLog: [...previous.activityLog, crmLogEntry(`Lead convertido em Customer "${customer.name}".`, customer.createdAt)],
            }
          : previous,
      );
    },
  });
}
