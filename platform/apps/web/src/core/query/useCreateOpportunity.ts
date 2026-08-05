import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmLogEntry, type CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";
import { crmClient } from "@core/http/clients/crmClient";
import type { CreateOpportunityRequestDto } from "@core/http/dtos/crm.dto";

/** Command "CreateOpportunity" real (`POST /crm/opportunities`) — acrescenta a Opportunity ao CRM Workspace em cache. */
export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOpportunityRequestDto) => crmClient.createOpportunity(payload),
    onSuccess: (opportunity) => {
      queryClient.setQueryData<CrmWorkspaceSnapshot>(["crm", "workspace"], (previous) =>
        previous
          ? { ...previous, opportunities: [...previous.opportunities, opportunity], activityLog: [...previous.activityLog, crmLogEntry(`Oportunidade "${opportunity.title}" criada.`, opportunity.createdAt)] }
          : previous,
      );
    },
  });
}
