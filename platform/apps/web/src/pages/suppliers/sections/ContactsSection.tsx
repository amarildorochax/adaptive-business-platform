import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { Field } from "@shared/components/ui/Field";
import { Select } from "@shared/components/ui/Select";
import { Table, type TableColumn } from "@shared/components/ui/Table";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { SupplierContactResponseDto, SupplierResponseDto } from "@core/supplier/supplier.dto";
import { useAddSupplierContact } from "@core/supplier/useAddSupplierContact";

const ROLE_LABEL: Record<string, string> = { Commercial: "Comercial", Financial: "Financeiro", Logistics: "Logística" };

interface ContactRow extends SupplierContactResponseDto {
  readonly supplierName: string;
}

/**
 * Contatos (IMP-205) — "Consumir exclusivamente os dados reais do Supplier. Nunca criar
 * persistência local." `SupplierContact` é parte interna do Aggregate `Supplier` (Core, IMP-201,
 * sem Repository próprio) — nunca um recurso HTTP independente; esta seção agrega
 * `supplier.contacts` já embutido em cada linha de `useSuppliers`, nunca uma segunda fonte. O
 * formulário de associação é real (`useAddSupplierContact`, `POST /suppliers/:supplierId/contacts`,
 * IMP-203).
 */
export function ContactsSection({ suppliers, onLogged }: { readonly suppliers: readonly SupplierResponseDto[]; readonly onLogged: (message: string) => void }) {
  const { showToast } = useToast();
  const addContact = useAddSupplierContact();

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.supplierId ?? "");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"Commercial" | "Financial" | "Logistics">("Commercial");

  const rows: readonly ContactRow[] = suppliers.flatMap((supplier) => supplier.contacts.map((contact) => ({ ...contact, supplierName: supplier.legalName })));

  const columns: readonly TableColumn<ContactRow>[] = [
    { key: "name", header: "Nome", render: (row) => row.name, sortValue: (row) => row.name },
    { key: "role", header: "Papel", render: (row) => ROLE_LABEL[row.role] ?? row.role },
    { key: "supplierName", header: "Fornecedor", render: (row) => row.supplierName, sortValue: (row) => row.supplierName },
    { key: "channelId", header: "Canal", render: (row) => row.channelId ?? "—" },
  ];

  return (
    <div className="dashboard-section">
      <WidgetCard title="Contatos por Fornecedor">
        <Table columns={columns} rows={rows} getRowId={(row) => row.contactId} searchPlaceholder="Buscar por nome…" searchText={(row) => `${row.name} ${row.supplierName}`} emptyTitle="Nenhum Contato associado ainda" />
      </WidgetCard>

      <WidgetCard title="Associar novo Contato">
        {suppliers.length === 0 ? (
          <p>Cadastre um Fornecedor antes de associar um Contato.</p>
        ) : (
          <>
            <div className="form-grid">
              <Select label="Fornecedor" value={selectedSupplierId} onChange={(event) => setSelectedSupplierId(event.target.value)}>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplierId} value={supplier.supplierId}>
                    {supplier.legalName}
                  </option>
                ))}
              </Select>
              <Field label="Nome" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Maria Souza" />
              <Select label="Papel" value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
                <option value="Commercial">Comercial</option>
                <option value="Financial">Financeiro</option>
                <option value="Logistics">Logística</option>
              </Select>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={!name.trim() || !selectedSupplierId || addContact.isPending}
              onClick={() =>
                addContact.mutate(
                  { supplierId: selectedSupplierId, payload: { name: name.trim(), role } },
                  {
                    onSuccess: () => {
                      showToast("success", `Contato "${name.trim()}" associado.`);
                      onLogged(`Contato "${name.trim()}" associado a um Fornecedor.`);
                      setName("");
                    },
                    onError: () => showToast("danger", "Não foi possível associar o Contato."),
                  },
                )
              }
            >
              Associar Contato
            </Button>
          </>
        )}
      </WidgetCard>
    </div>
  );
}
