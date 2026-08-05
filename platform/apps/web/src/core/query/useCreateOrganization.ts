import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmLogEntry, type CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";
import { crmClient } from "@core/http/clients/crmClient";
import type { CreateOrganizationRequestDto } from "@core/http/dtos/crm.dto";

/** Cadastro real de Organization (`POST /crm/organizations`) — sem Command Frozen correspondente (ver `CRM_CORE_MIGRATION_REPORT.md`), mas o cadastro em si é real. */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrganizationRequestDto) => crmClient.createOrganization(payload),
    onSuccess: ({ organization, relationship }) => {
      queryClient.setQueryData<CrmWorkspaceSnapshot>(["crm", "workspace"], (previous) =>
        previous
          ? {
              ...previous,
              organizations: [...previous.organizations, organization],
              relationships: [...previous.relationships, relationship],
              activityLog: [...previous.activityLog, crmLogEntry(`Organização "${organization.name}" cadastrada.`, organization.createdAt)],
            }
          : previous,
      );
    },
  });
}
