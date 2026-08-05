import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmLogEntry, type CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";
import { crmClient } from "@core/http/clients/crmClient";
import type { CreateCustomerRequestDto } from "@core/http/dtos/crm.dto";

/** Command "CreateCustomer" real (`POST /crm/customers`) — cadastro direto, sem Lead prévio. */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomerRequestDto) => crmClient.createCustomer(payload),
    onSuccess: ({ customer, relationship }) => {
      queryClient.setQueryData<CrmWorkspaceSnapshot>(["crm", "workspace"], (previous) =>
        previous
          ? {
              ...previous,
              customers: [...previous.customers, customer],
              relationships: [...previous.relationships, relationship],
              activityLog: [...previous.activityLog, crmLogEntry(`Customer "${customer.name}" cadastrado diretamente.`, customer.createdAt)],
            }
          : previous,
      );
    },
  });
}
