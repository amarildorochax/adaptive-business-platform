import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmLogEntry, type CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";
import { crmClient } from "@core/http/clients/crmClient";
import type { CreateContactRequestDto } from "@core/http/dtos/crm.dto";

/** Associação real de Contact (`POST /crm/contacts`) — sem Command/Evento Frozen correspondente (mesmo motivo de `useCreateOrganization`). */
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateContactRequestDto) => crmClient.createContact(payload),
    onSuccess: (contact) => {
      queryClient.setQueryData<CrmWorkspaceSnapshot>(["crm", "workspace"], (previous) =>
        previous
          ? {
              ...previous,
              contacts: [...previous.contacts, contact],
              activityLog: [...previous.activityLog, crmLogEntry(`Contact "${contact.name}" associado a ${contact.associationType} ${contact.associationId}.`, contact.createdAt)],
            }
          : previous,
      );
    },
  });
}
