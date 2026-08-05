import { useMemo, useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Select } from "@shared/components/ui/Select";
import { Table, type TableColumn } from "@shared/components/ui/Table";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";
import { useCreateContact } from "@core/query/useCreateContact";
import { useCreateCustomer } from "@core/query/useCreateCustomer";
import { useCreateOrganization } from "@core/query/useCreateOrganization";

const STATUS_TONE = { Active: "success", Inactive: "neutral", Archived: "danger" } as const;

interface ClientRow {
  readonly id: string;
  readonly name: string;
  readonly kind: "Organização" | "Customer";
  readonly status: string;
  readonly lifecycleStage: string;
  readonly accountManagerId: string;
}

function buildRows(workspace: CrmWorkspaceSnapshot): readonly ClientRow[] {
  const organizationRows = workspace.organizations.map((organization) => {
    const relationship = workspace.relationships.find((candidate) => candidate.relationshipId === organization.relationshipId);
    return { id: organization.organizationId, name: organization.name, kind: "Organização" as const, status: relationship?.status ?? "—", lifecycleStage: relationship?.lifecycleStage ?? "—", accountManagerId: relationship?.accountManagerId ?? "—" };
  });
  const customerRows = workspace.customers.map((customer) => {
    const relationship = workspace.relationships.find((candidate) => candidate.relationshipId === customer.relationshipId);
    return { id: customer.customerId, name: customer.name, kind: "Customer" as const, status: relationship?.status ?? "—", lifecycleStage: relationship?.lifecycleStage ?? "—", accountManagerId: relationship?.accountManagerId ?? "—" };
  });
  return [...organizationRows, ...customerRows];
}

/**
 * Clientes (FUN-103) — lista real (Organization + Customer já acumulados no CRM Workspace), busca e
 * paginação client-side reutilizando `Table` (mesmo padrão já usado por outras Sprints — nenhuma
 * busca server-side existe em `CRMManager`). Status/Lifecycle Stage vêm do `Relationship` real.
 * "Segmentação" e "Última interação", pedidos pela Sprint, não têm nenhum campo/Manager correspondente
 * (`Segment Manager` nunca implementado, `Relationship`/`Customer` não têm nenhum campo de última
 * interação) — `NotConnectedNotice`. Formulários reais para Organization/Customer/Contact.
 */
export function CustomersSection({ workspace, tenantId }: { readonly workspace: CrmWorkspaceSnapshot; readonly tenantId: string }) {
  const rows = useMemo(() => buildRows(workspace), [workspace]);
  const createOrganization = useCreateOrganization();
  const createCustomer = useCreateCustomer();
  const createContact = useCreateContact();
  const { showToast } = useToast();

  const [orgName, setOrgName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactAssociationId, setContactAssociationId] = useState(workspace.organizations[0]?.organizationId ?? "");

  const columns: readonly TableColumn<ClientRow>[] = [
    { key: "name", header: "Nome", render: (row) => row.name, sortValue: (row) => row.name },
    { key: "kind", header: "Tipo", render: (row) => row.kind },
    { key: "status", header: "Status", render: (row) => <Badge tone={STATUS_TONE[row.status as keyof typeof STATUS_TONE] ?? "neutral"}>{row.status}</Badge> },
    { key: "lifecycleStage", header: "Estágio", render: (row) => row.lifecycleStage },
    { key: "accountManagerId", header: "Responsável", render: (row) => row.accountManagerId },
  ];

  return (
    <div className="dashboard-section">
      <WidgetCard title="Clientes e Organizações">
        <Table columns={columns} rows={rows} getRowId={(row) => row.id} searchPlaceholder="Buscar por nome…" searchText={(row) => row.name} emptyTitle="Nenhum Cliente cadastrado ainda" />
      </WidgetCard>

      <NotConnectedNotice fields={["Segmentação", "Última interação"]} context="CRM Hub" />

      <div className="dashboard-grid">
        <WidgetCard title="Nova Organização">
          <div className="form-grid">
            <Field label="Nome" value={orgName} onChange={(event) => setOrgName(event.target.value)} placeholder="Ex.: Comércio ABC Ltda." />
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={!orgName.trim() || createOrganization.isPending}
            onClick={() =>
              createOrganization.mutate(
                { tenantId, name: orgName.trim(), accountManagerId: "identity-demo" },
                { onSuccess: () => { showToast("success", "Organização cadastrada."); setOrgName(""); }, onError: () => showToast("danger", "Não foi possível cadastrar a Organização.") },
              )
            }
          >
            Cadastrar Organização
          </Button>
        </WidgetCard>

        <WidgetCard title="Novo Customer">
          <div className="form-grid">
            <Field label="Nome" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Ex.: Maria Silva" />
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={!customerName.trim() || createCustomer.isPending}
            onClick={() =>
              createCustomer.mutate(
                { tenantId, name: customerName.trim(), accountManagerId: "identity-demo" },
                { onSuccess: () => { showToast("success", "Customer cadastrado."); setCustomerName(""); }, onError: () => showToast("danger", "Não foi possível cadastrar o Customer.") },
              )
            }
          >
            Cadastrar Customer
          </Button>
        </WidgetCard>

        <WidgetCard title="Novo Contact">
          <div className="form-grid">
            <Field label="Nome" value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Ex.: João Souza" />
            <Select label="Organização" value={contactAssociationId} onChange={(event) => setContactAssociationId(event.target.value)}>
              {workspace.organizations.length === 0 && <option value="">Nenhuma Organização cadastrada</option>}
              {workspace.organizations.map((organization) => (
                <option key={organization.organizationId} value={organization.organizationId}>
                  {organization.name}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={!contactName.trim() || !contactAssociationId || createContact.isPending}
            onClick={() =>
              createContact.mutate(
                { tenantId, name: contactName.trim(), associationType: "Organization", associationId: contactAssociationId },
                { onSuccess: () => { showToast("success", "Contact associado."); setContactName(""); }, onError: () => showToast("danger", "Não foi possível associar o Contact.") },
              )
            }
          >
            Associar Contact
          </Button>
        </WidgetCard>
      </div>
    </div>
  );
}
