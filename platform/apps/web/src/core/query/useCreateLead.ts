import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmLogEntry, type CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";
import { crmClient } from "@core/http/clients/crmClient";
import type { CreateLeadRequestDto } from "@core/http/dtos/crm.dto";

/** Command "CreateLead" real (`POST /crm/leads`) — acrescenta o Lead devolvido ao CRM Workspace em cache. */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLeadRequestDto) => crmClient.createLead(payload),
    onSuccess: (lead) => {
      queryClient.setQueryData<CrmWorkspaceSnapshot>(["crm", "workspace"], (previous) =>
        previous ? { ...previous, leads: [...previous.leads, lead], activityLog: [...previous.activityLog, crmLogEntry(`Lead "${lead.name}" capturado (origem: ${lead.source}).`, lead.createdAt)] } : previous,
      );
    },
  });
}
