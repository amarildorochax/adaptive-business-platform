import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmLogEntry, type CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";
import { crmClient } from "@core/http/clients/crmClient";
import type { UpdateCustomerRequestDto } from "@core/http/dtos/crm.dto";

/** Command "UpdateCustomer" real (`PATCH /crm/customers/:customerId`) — substitui o Customer correspondente já em cache. */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, payload }: { readonly customerId: string; readonly payload: UpdateCustomerRequestDto }) => crmClient.updateCustomer(customerId, payload),
    onSuccess: (customer) => {
      queryClient.setQueryData<CrmWorkspaceSnapshot>(["crm", "workspace"], (previous) =>
        previous
          ? {
              ...previous,
              customers: previous.customers.map((existing) => (existing.customerId === customer.customerId ? customer : existing)),
              activityLog: [...previous.activityLog, crmLogEntry(`Customer "${customer.name}" atualizado.`)],
            }
          : previous,
      );
    },
  });
}
