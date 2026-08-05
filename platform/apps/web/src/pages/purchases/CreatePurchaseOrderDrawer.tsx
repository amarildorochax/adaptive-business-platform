import { useState } from "react";
import { Button } from "@shared/components/ui/Button";
import { Drawer } from "@shared/components/ui/Drawer";
import { Field } from "@shared/components/ui/Field";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { PurchaseOrderResponseDto } from "@core/purchase/purchase.dto";
import { useCreatePurchaseOrder } from "@core/purchase/useCreatePurchaseOrder";

/**
 * Drawer de criação de Purchase Order (IMP-305) — Ação Rápida "Novo Pedido" do `PageHeader`
 * (`PurchasePage.tsx`), mesmo padrão de `CreateSupplierDrawer.tsx` (UX-002/IMP-205). Apenas o
 * Fornecedor é pedido — `CreatePurchaseOrderInput` (Core, IMP-301) não recebe itens na criação
 * (`AddPurchaseOrderItem` é um Command separado, disponível na aba "Pedidos" após a criação).
 */
export function CreatePurchaseOrderDrawer({ open, onClose, tenantId, onCreated }: { readonly open: boolean; readonly onClose: () => void; readonly tenantId: string; readonly onCreated: (purchaseOrder: PurchaseOrderResponseDto) => void }) {
  const { showToast } = useToast();
  const createPurchaseOrder = useCreatePurchaseOrder();
  const [supplierId, setSupplierId] = useState("");

  function close() {
    setSupplierId("");
    onClose();
  }

  function submit() {
    if (!supplierId.trim()) {
      return;
    }
    createPurchaseOrder.mutate(
      { tenantId, supplierId: supplierId.trim() },
      {
        onSuccess: (purchaseOrder) => {
          showToast("success", "Pedido criado.");
          onCreated(purchaseOrder);
          close();
        },
        onError: () => showToast("danger", "Não foi possível criar o Pedido."),
      },
    );
  }

  return (
    <Drawer open={open} onClose={close} title="Novo Pedido de Compra">
      <div className="form-grid">
        <Field label="Identificador do Fornecedor" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} placeholder="Ex.: supplier-123" />
      </div>
      <Button type="button" variant="primary" disabled={!supplierId.trim() || createPurchaseOrder.isPending} onClick={submit}>
        Criar Pedido
      </Button>
    </Drawer>
  );
}
