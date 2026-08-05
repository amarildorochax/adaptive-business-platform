import { useState } from "react";
import { Button } from "@shared/components/ui/Button";
import { Drawer } from "@shared/components/ui/Drawer";
import { Field } from "@shared/components/ui/Field";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { SupplierResponseDto } from "@core/supplier/supplier.dto";
import { useCreateSupplier } from "@core/supplier/useCreateSupplier";

const EMPTY_FORM = { legalName: "", taxId: "", supplyCategory: "" };

/**
 * Drawer de criação de Fornecedor (UX-002) — extraído de `SuppliersSection.tsx` (IMP-205) para que
 * a Ação Rápida "Novo Fornecedor" do `PageHeader` (`SupplierPage.tsx`) possa abri-lo a partir de
 * qualquer aba, não apenas da aba "Fornecedores" — "Navegação... Ações rápidas. Atalhos", Capítulo
 * 7 desta Sprint. `SuppliersSection` continua com seu próprio botão "Novo Fornecedor" (in-tab, per
 * descoberta contextual já validada pela IMP-205) — ambos os gatilhos abrem exatamente este mesmo
 * componente, nunca dois formulários duplicados.
 */
export function CreateSupplierDrawer({ open, onClose, tenantId, onCreated }: { readonly open: boolean; readonly onClose: () => void; readonly tenantId: string; readonly onCreated: (supplier: SupplierResponseDto) => void }) {
  const { showToast } = useToast();
  const createSupplier = useCreateSupplier();
  const [form, setForm] = useState(EMPTY_FORM);

  function close() {
    setForm(EMPTY_FORM);
    onClose();
  }

  function submit() {
    createSupplier.mutate(
      { tenantId, legalName: form.legalName.trim(), taxId: form.taxId.trim(), supplyCategory: form.supplyCategory.trim() || undefined },
      {
        onSuccess: (supplier) => {
          showToast("success", `Fornecedor "${supplier.legalName}" cadastrado.`);
          onCreated(supplier);
          close();
        },
        onError: () => showToast("danger", "Não foi possível cadastrar o Fornecedor."),
      },
    );
  }

  return (
    <Drawer open={open} onClose={close} title="Novo Fornecedor">
      <div className="form-grid">
        <Field label="Razão Social" value={form.legalName} onChange={(event) => setForm({ ...form, legalName: event.target.value })} placeholder="Ex.: Floricultura Atacado Ltda." />
        <Field label="Documento (CPF/CNPJ, sem máscara)" value={form.taxId} onChange={(event) => setForm({ ...form, taxId: event.target.value })} placeholder="Ex.: 12345678000199" />
        <Field label="Categoria de fornecimento (opcional)" value={form.supplyCategory} onChange={(event) => setForm({ ...form, supplyCategory: event.target.value })} placeholder="Ex.: Flores" />
      </div>
      <Button type="button" variant="primary" disabled={!form.legalName.trim() || !form.taxId.trim() || createSupplier.isPending} onClick={submit}>
        Cadastrar Fornecedor
      </Button>
    </Drawer>
  );
}
