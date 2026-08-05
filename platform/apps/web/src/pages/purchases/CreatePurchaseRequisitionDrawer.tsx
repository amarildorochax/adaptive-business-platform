import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@shared/components/ui/Button";
import { Drawer } from "@shared/components/ui/Drawer";
import { Field } from "@shared/components/ui/Field";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { PurchaseRequisitionLineDto, PurchaseRequisitionResponseDto } from "@core/purchase/purchase.dto";
import { useCreatePurchaseRequisition } from "@core/purchase/useCreatePurchaseRequisition";

/**
 * Drawer de criação de Purchase Requisition (IMP-305) — Ação Rápida "Nova Requisição" do
 * `PageHeader` (`PurchasePage.tsx`), mesmo padrão de `CreateSupplierDrawer.tsx` (UX-002/IMP-205):
 * um único componente aberto tanto pela Ação Rápida quanto pelo botão in-tab de `RequisitionsSection`,
 * nunca dois formulários duplicados. Suporta múltiplas linhas (Produto + quantidade sugerida) — a
 * única seção deste Workspace que monta uma lista dinâmica, porque `CreatePurchaseRequisitionInput`
 * (Core, IMP-301) é o único Command cujo corpo é, ele mesmo, uma lista de itens.
 */
export function CreatePurchaseRequisitionDrawer({ open, onClose, tenantId, onCreated }: { readonly open: boolean; readonly onClose: () => void; readonly tenantId: string; readonly onCreated: (requisition: PurchaseRequisitionResponseDto) => void }) {
  const { showToast } = useToast();
  const createRequisition = useCreatePurchaseRequisition();
  const [lines, setLines] = useState<readonly PurchaseRequisitionLineDto[]>([]);
  const [productId, setProductId] = useState("");
  const [suggestedQuantity, setSuggestedQuantity] = useState("1");

  function close() {
    setLines([]);
    setProductId("");
    setSuggestedQuantity("1");
    onClose();
  }

  function addLine() {
    if (!productId.trim() || !suggestedQuantity) {
      return;
    }
    setLines((current) => [...current, { productId: productId.trim(), suggestedQuantity: Number(suggestedQuantity) }]);
    setProductId("");
    setSuggestedQuantity("1");
  }

  function removeLine(index: number) {
    setLines((current) => current.filter((_, i) => i !== index));
  }

  function submit() {
    if (lines.length === 0) {
      return;
    }
    createRequisition.mutate(
      { tenantId, origin: "Manual", lines },
      {
        onSuccess: (requisition) => {
          showToast("success", "Requisição criada.");
          onCreated(requisition);
          close();
        },
        onError: () => showToast("danger", "Não foi possível criar a Requisição."),
      },
    );
  }

  return (
    <Drawer open={open} onClose={close} title="Nova Requisição de Compra">
      <div className="form-grid">
        <Field label="Identificador do Produto" value={productId} onChange={(event) => setProductId(event.target.value)} placeholder="Ex.: product-123" />
        <Field label="Quantidade sugerida" type="number" min={1} value={suggestedQuantity} onChange={(event) => setSuggestedQuantity(event.target.value)} />
      </div>
      <Button type="button" variant="secondary" disabled={!productId.trim()} onClick={addLine}>
        Adicionar Produto
      </Button>

      {lines.length > 0 && (
        <ul className="activity-log-list">
          {lines.map((line, index) => (
            <li key={`${line.productId}-${index}`}>
              <span>{line.productId}</span>
              <span>{line.suggestedQuantity} un.</span>
              <Button type="button" variant="ghost" size="sm" icon onClick={() => removeLine(index)} aria-label={`Remover ${line.productId}`}>
                <Trash2 size={14} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button type="button" variant="primary" disabled={lines.length === 0 || createRequisition.isPending} onClick={submit}>
        Criar Requisição
      </Button>
    </Drawer>
  );
}
