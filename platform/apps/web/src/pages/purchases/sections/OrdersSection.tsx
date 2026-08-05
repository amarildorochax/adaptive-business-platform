import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { Drawer } from "@shared/components/ui/Drawer";
import { Field } from "@shared/components/ui/Field";
import { PurchaseStatusBadge } from "@shared/components/ui/PurchaseStatusBadge";
import { Table, type TableColumn } from "@shared/components/ui/Table";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { PurchaseOrderResponseDto } from "@core/purchase/purchase.dto";
import { useAddPurchaseOrderItem } from "@core/purchase/useAddPurchaseOrderItem";
import { useApprovePurchaseOrder } from "@core/purchase/useApprovePurchaseOrder";
import { useCancelPurchaseOrder } from "@core/purchase/useCancelPurchaseOrder";
import { useSendPurchaseOrderToSupplier } from "@core/purchase/useSendPurchaseOrderToSupplier";

const CANCELLABLE_STATUSES = new Set(["Draft", "PendingApproval", "Approved", "Sent"]);
const ADD_ITEM_STATUSES = new Set(["Draft", "PendingApproval"]);

interface AddItemFormState {
  readonly productId: string;
  readonly quantityOrdered: string;
  readonly amount: string;
  readonly currencyCode: string;
}

interface ApproveFormState {
  readonly thresholdAmount: string;
  readonly currencyCode: string;
  readonly approvedByIdentityId: string;
}

function totalValue(purchaseOrder: PurchaseOrderResponseDto): string | undefined {
  if (purchaseOrder.items.length === 0) {
    return undefined;
  }
  const currencyCode = purchaseOrder.items[0]!.acquisitionCost.currencyCode;
  const amount = purchaseOrder.items.reduce((sum, item) => sum + item.acquisitionCost.amount * item.quantityOrdered, 0);
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currencyCode }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Pedidos (IMP-305) — tabela real (`usePurchaseOrders`, carregada por `PurchasePage.tsx`). Ações
 * reais por linha, condicionadas ao status atual — exatamente a máquina de estados já validada em
 * `PurchasePolicy.canTransitionPurchaseOrderStatus`/`canAddPurchaseOrderItem` (Core, IMP-301), nunca
 * uma regra de negócio nova nesta camada: "Adicionar Item" (Draft/PendingApproval), "Aprovar"
 * (PendingApproval), "Enviar ao Fornecedor" (Approved), "Cancelar" (Draft/PendingApproval/Approved/
 * Sent — nunca após qualquer Receiving). Nenhuma ação client-side decide se uma transição é válida —
 * o botão apenas chama o Command real; se o servidor rejeitar (ex.: corrida entre duas abas), o erro
 * real (`ApiError`) aparece via toast, nunca escondido.
 */
export function OrdersSection({
  purchaseOrders,
  onCreateRequested,
  onLogged,
}: {
  readonly purchaseOrders: readonly PurchaseOrderResponseDto[];
  readonly onCreateRequested: () => void;
  readonly onLogged: (message: string) => void;
}) {
  const { showToast } = useToast();
  const addItem = useAddPurchaseOrderItem();
  const approveOrder = useApprovePurchaseOrder();
  const sendOrder = useSendPurchaseOrderToSupplier();
  const cancelOrder = useCancelPurchaseOrder();

  const [addingItemTo, setAddingItemTo] = useState<string | undefined>(undefined);
  const [itemForm, setItemForm] = useState<AddItemFormState>({ productId: "", quantityOrdered: "1", amount: "", currencyCode: "BRL" });

  const [approvingId, setApprovingId] = useState<string | undefined>(undefined);
  const [approveForm, setApproveForm] = useState<ApproveFormState>({ thresholdAmount: "1000", currencyCode: "BRL", approvedByIdentityId: "" });

  function submitAddItem() {
    if (!addingItemTo || !itemForm.productId.trim() || !itemForm.quantityOrdered || !itemForm.amount) {
      return;
    }
    addItem.mutate(
      {
        purchaseOrderId: addingItemTo,
        payload: { productId: itemForm.productId.trim(), quantityOrdered: Number(itemForm.quantityOrdered), acquisitionCost: { amount: Number(itemForm.amount), currencyCode: itemForm.currencyCode } },
      },
      {
        onSuccess: () => {
          showToast("success", "Item adicionado ao Pedido.");
          onLogged(`Item "${itemForm.productId.trim()}" adicionado ao Pedido ${addingItemTo.slice(0, 8)}.`);
          setAddingItemTo(undefined);
          setItemForm({ productId: "", quantityOrdered: "1", amount: "", currencyCode: "BRL" });
        },
        onError: () => showToast("danger", "Não foi possível adicionar o item — o Pedido pode já ter saído da fase de montagem."),
      },
    );
  }

  function submitApprove() {
    if (!approvingId || !approveForm.thresholdAmount) {
      return;
    }
    approveOrder.mutate(
      {
        purchaseOrderId: approvingId,
        payload: { threshold: { amount: Number(approveForm.thresholdAmount), currencyCode: approveForm.currencyCode }, approvedByIdentityId: approveForm.approvedByIdentityId.trim() || undefined },
      },
      {
        onSuccess: () => {
          showToast("success", "Pedido aprovado.");
          onLogged(`Pedido ${approvingId.slice(0, 8)} aprovado.`);
          setApprovingId(undefined);
        },
        onError: () => showToast("danger", "Não foi possível aprovar — acima do teto, este Pedido exige uma identidade de aprovação explícita."),
      },
    );
  }

  const columns: readonly TableColumn<PurchaseOrderResponseDto>[] = [
    { key: "purchaseOrderId", header: "Pedido", render: (row) => row.purchaseOrderId.slice(0, 8), sortValue: (row) => row.purchaseOrderId },
    { key: "supplierId", header: "Fornecedor", render: (row) => row.supplierId.slice(0, 8), sortValue: (row) => row.supplierId },
    { key: "status", header: "Status", render: (row) => <PurchaseStatusBadge status={row.status} /> },
    { key: "items", header: "Itens", render: (row) => row.items.length, sortValue: (row) => row.items.length },
    { key: "total", header: "Valor", render: (row) => totalValue(row) ?? "—" },
  ];

  return (
    <div className="dashboard-section">
      <WidgetCard title="Pedidos de Compra">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <Button type="button" variant="primary" onClick={onCreateRequested}>
            Novo Pedido
          </Button>
        </div>
        <Table
          columns={columns}
          rows={purchaseOrders}
          getRowId={(row) => row.purchaseOrderId}
          searchPlaceholder="Buscar por identificador…"
          searchText={(row) => `${row.purchaseOrderId} ${row.supplierId}`}
          emptyTitle="Nenhum Pedido aberto ainda"
          emptyDescription="Crie o primeiro Pedido pelo botão acima."
          rowActions={(row) => (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ADD_ITEM_STATUSES.has(row.status) && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setAddingItemTo(row.purchaseOrderId)}>
                  Adicionar Item
                </Button>
              )}
              {row.status === "PendingApproval" && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setApprovingId(row.purchaseOrderId)}>
                  Aprovar
                </Button>
              )}
              {row.status === "Approved" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    sendOrder.mutate(row.purchaseOrderId, {
                      onSuccess: () => {
                        showToast("success", "Pedido enviado ao Fornecedor.");
                        onLogged(`Pedido ${row.purchaseOrderId.slice(0, 8)} enviado ao Fornecedor.`);
                      },
                      onError: () => showToast("danger", "Não foi possível enviar o Pedido."),
                    })
                  }
                >
                  Enviar ao Fornecedor
                </Button>
              )}
              {CANCELLABLE_STATUSES.has(row.status) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    cancelOrder.mutate(row.purchaseOrderId, {
                      onSuccess: () => {
                        showToast("success", "Pedido cancelado.");
                        onLogged(`Pedido ${row.purchaseOrderId.slice(0, 8)} cancelado.`);
                      },
                      onError: () => showToast("danger", "Não foi possível cancelar — este Pedido já possui Receiving registrado."),
                    })
                  }
                >
                  Cancelar
                </Button>
              )}
            </div>
          )}
        />
      </WidgetCard>

      <Drawer open={addingItemTo !== undefined} onClose={() => setAddingItemTo(undefined)} title="Adicionar Item ao Pedido">
        <div className="form-grid">
          <Field label="Identificador do Produto" value={itemForm.productId} onChange={(event) => setItemForm({ ...itemForm, productId: event.target.value })} placeholder="Ex.: product-123" />
          <Field label="Quantidade" type="number" min={1} value={itemForm.quantityOrdered} onChange={(event) => setItemForm({ ...itemForm, quantityOrdered: event.target.value })} />
          <Field label="Custo de aquisição unitário" type="number" min={0} step="0.01" value={itemForm.amount} onChange={(event) => setItemForm({ ...itemForm, amount: event.target.value })} />
          <Field label="Moeda" value={itemForm.currencyCode} onChange={(event) => setItemForm({ ...itemForm, currencyCode: event.target.value })} placeholder="BRL" />
        </div>
        <Button type="button" variant="primary" disabled={!itemForm.productId.trim() || !itemForm.amount || addItem.isPending} onClick={submitAddItem}>
          Adicionar
        </Button>
      </Drawer>

      <Drawer open={approvingId !== undefined} onClose={() => setApprovingId(undefined)} title="Aprovar Pedido">
        <div className="form-grid">
          <Field label="Teto de aprovação automática" type="number" min={0} step="0.01" value={approveForm.thresholdAmount} onChange={(event) => setApproveForm({ ...approveForm, thresholdAmount: event.target.value })} />
          <Field label="Moeda" value={approveForm.currencyCode} onChange={(event) => setApproveForm({ ...approveForm, currencyCode: event.target.value })} placeholder="BRL" />
          <Field
            label="Identidade de aprovação explícita (obrigatória apenas acima do teto)"
            value={approveForm.approvedByIdentityId}
            onChange={(event) => setApproveForm({ ...approveForm, approvedByIdentityId: event.target.value })}
            placeholder="Ex.: identity-123"
          />
        </div>
        <Button type="button" variant="primary" disabled={!approveForm.thresholdAmount || approveOrder.isPending} onClick={submitApprove}>
          Confirmar Aprovação
        </Button>
      </Drawer>
    </div>
  );
}
