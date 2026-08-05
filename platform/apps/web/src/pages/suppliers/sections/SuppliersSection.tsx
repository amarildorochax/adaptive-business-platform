import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import { Drawer } from "@shared/components/ui/Drawer";
import { Field } from "@shared/components/ui/Field";
import { SupplierStatusBadge } from "@shared/components/ui/SupplierStatusBadge";
import { Table, type TableColumn } from "@shared/components/ui/Table";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { SupplierResponseDto } from "@core/supplier/supplier.dto";
import { useDisableSupplier } from "@core/supplier/useDisableSupplier";
import { useReactivateSupplier } from "@core/supplier/useReactivateSupplier";
import { useUpdateSupplier } from "@core/supplier/useUpdateSupplier";

interface EditFormState {
  readonly legalName: string;
  readonly taxId: string;
  readonly supplyCategory: string;
}

/**
 * Fornecedores (IMP-205) — tabela moderna (`Table`, busca/ordenação/paginação já embutidas) sobre
 * o dado real de `useSuppliers`. Ativar/Desativar por linha (`useReactivateSupplier`/
 * `useDisableSupplier`). "Excluir somente se houver endpoint" — `SupplierManager` (Core, IMP-201)
 * nunca expôs nenhum Command de remoção; nenhuma ação de exclusão é exibida, per instrução
 * explícita desta Sprint.
 *
 * Criar Fornecedor (UX-002) — extraído para `CreateSupplierDrawer.tsx`, aberto tanto pelo botão
 * "Novo Fornecedor" desta seção quanto pela Ação Rápida do `PageHeader` (`SupplierPage.tsx`),
 * nunca duplicado; `onOpenCreate` é a única ponte entre os dois gatilhos e o mesmo Drawer.
 */
export function SuppliersSection({ suppliers, onLogged, onOpenCreate }: { readonly suppliers: readonly SupplierResponseDto[]; readonly onLogged: (message: string) => void; readonly onOpenCreate: () => void }) {
  const { showToast } = useToast();
  const updateSupplier = useUpdateSupplier();
  const disableSupplier = useDisableSupplier();
  const reactivateSupplier = useReactivateSupplier();

  const [editingSupplierId, setEditingSupplierId] = useState<string | undefined>(undefined);
  const [form, setForm] = useState<EditFormState>({ legalName: "", taxId: "", supplyCategory: "" });

  function openEdit(supplier: SupplierResponseDto) {
    setForm({ legalName: supplier.legalName, taxId: supplier.taxId, supplyCategory: supplier.supplyCategory ?? "" });
    setEditingSupplierId(supplier.supplierId);
  }

  function closeEdit() {
    setEditingSupplierId(undefined);
  }

  function submitEdit() {
    if (!editingSupplierId) {
      return;
    }
    updateSupplier.mutate(
      { supplierId: editingSupplierId, payload: { legalName: form.legalName.trim(), taxId: form.taxId.trim(), supplyCategory: form.supplyCategory.trim() || undefined } },
      {
        onSuccess: (supplier) => {
          showToast("success", `Fornecedor "${supplier.legalName}" atualizado.`);
          onLogged(`Fornecedor "${supplier.legalName}" atualizado.`);
          closeEdit();
        },
        onError: () => showToast("danger", "Não foi possível atualizar o Fornecedor."),
      },
    );
  }

  function toggleStatus(supplier: SupplierResponseDto) {
    const mutation = supplier.status === "Active" ? disableSupplier : reactivateSupplier;
    mutation.mutate(supplier.supplierId, {
      onSuccess: (updated) => {
        showToast("success", `Fornecedor "${updated.legalName}" ${updated.status === "Active" ? "reativado" : "desabilitado"}.`);
        onLogged(`Fornecedor "${updated.legalName}" ${updated.status === "Active" ? "reativado" : "desabilitado"}.`);
      },
      onError: () => showToast("danger", "Não foi possível alterar o status do Fornecedor."),
    });
  }

  const columns: readonly TableColumn<SupplierResponseDto>[] = [
    { key: "legalName", header: "Nome", render: (row) => row.legalName, sortValue: (row) => row.legalName },
    { key: "status", header: "Status", render: (row) => <SupplierStatusBadge status={row.status} /> },
    { key: "taxId", header: "Documento", render: (row) => row.taxId },
    { key: "supplyCategory", header: "Categoria", render: (row) => row.supplyCategory ?? <Badge tone="neutral">—</Badge> },
    { key: "contacts", header: "Contatos", render: (row) => row.contacts.length, sortValue: (row) => row.contacts.length },
  ];

  return (
    <div className="dashboard-section">
      <WidgetCard title="Fornecedores">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <Button type="button" variant="primary" onClick={onOpenCreate}>
            Novo Fornecedor
          </Button>
        </div>
        <Table
          columns={columns}
          rows={suppliers}
          getRowId={(row) => row.supplierId}
          searchPlaceholder="Buscar por nome ou documento…"
          searchText={(row) => `${row.legalName} ${row.taxId}`}
          emptyTitle="Nenhum Fornecedor cadastrado ainda"
          emptyDescription="Cadastre o primeiro Fornecedor pelo botão acima."
          rowActions={(row) => (
            <div style={{ display: "flex", gap: 8 }}>
              <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(row)}>
                Editar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => toggleStatus(row)}>
                {row.status === "Active" ? "Desativar" : "Ativar"}
              </Button>
            </div>
          )}
        />
      </WidgetCard>

      <Drawer open={editingSupplierId !== undefined} onClose={closeEdit} title="Editar Fornecedor">
        <div className="form-grid">
          <Field label="Razão Social" value={form.legalName} onChange={(event) => setForm({ ...form, legalName: event.target.value })} placeholder="Ex.: Floricultura Atacado Ltda." />
          <Field label="Documento (CPF/CNPJ, sem máscara)" value={form.taxId} onChange={(event) => setForm({ ...form, taxId: event.target.value })} placeholder="Ex.: 12345678000199" />
          <Field label="Categoria de fornecimento (opcional)" value={form.supplyCategory} onChange={(event) => setForm({ ...form, supplyCategory: event.target.value })} placeholder="Ex.: Flores" />
        </div>
        <Button type="button" variant="primary" disabled={!form.legalName.trim() || !form.taxId.trim() || updateSupplier.isPending} onClick={submitEdit}>
          Salvar alterações
        </Button>
      </Drawer>
    </div>
  );
}
