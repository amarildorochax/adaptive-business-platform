import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { ReceivingCard } from "@shared/components/ui/ReceivingCard";
import { Select } from "@shared/components/ui/Select";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { PurchaseOrderResponseDto } from "@core/purchase/purchase.dto";
import { useReceivings } from "@core/purchase/useReceivings";
import { useRegisterReceiving } from "@core/purchase/useRegisterReceiving";

const RECEIVABLE_STATUSES = new Set(["Sent", "PartiallyReceived"]);

/**
 * Recebimentos (IMP-305) — "Consumir somente os dados realmente disponíveis." Lista real de
 * Receiving já registrados contra o Pedido selecionado (`useReceivings`, `core/purchase/`, IMP-304),
 * formulário real de registro (`useRegisterReceiving`).
 *
 * LIMITAÇÃO CONHECIDA (OBRIGATÓRIA, per instrução explícita de IMP-305) — documentada em
 * `IMP_303_PURCHASE_HTTP_API_REPORT.md`, Capítulo 8, e em `IMP_304_PURCHASE_FRONTEND_REPORT.md`,
 * Capítulo 9: um segundo `registerReceiving` contra o mesmo Purchase Order falha com um erro real do
 * servidor (bug de Persistência em `SqlitePurchaseOrderRepository.replaceItems`, IMP-302, ainda não
 * corrigido). Esta seção **nunca esconde** essa limitação e **nunca cria workaround** — quando o
 * Pedido selecionado já possui ao menos um Receiving, um `NotConnectedNotice` explica exatamente o
 * que está acontecendo e o formulário de registro é desabilitado (nunca escondido, apenas
 * inacessível, com a razão visível) — evitando apenas que o usuário dispare uma chamada que sabemos,
 * com certeza, que falhará; nenhuma lógica tenta mascarar, simular ou reescrever esse resultado. Se
 * o usuário ainda assim alcançar essa chamada (ex.: corrida entre duas abas), o erro real (`ApiError`,
 * 500) aparece via toast, nunca engolido silenciosamente.
 */
export function ReceivingsSection({
  purchaseOrders,
  onFullyReceived,
  onLogged,
}: {
  readonly purchaseOrders: readonly PurchaseOrderResponseDto[];
  readonly onFullyReceived: (purchaseOrder: PurchaseOrderResponseDto) => void;
  readonly onLogged: (message: string) => void;
}) {
  const { showToast } = useToast();
  const receivable = purchaseOrders.filter((po) => RECEIVABLE_STATUSES.has(po.status));
  const [selectedId, setSelectedId] = useState(receivable[0]?.purchaseOrderId ?? "");
  const selected = receivable.find((po) => po.purchaseOrderId === selectedId);

  const receivings = useReceivings(selected?.purchaseOrderId);
  const registerReceiving = useRegisterReceiving();

  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const alreadyHasReceiving = (receivings.data?.length ?? 0) > 0;
  const pendingItems = selected ? selected.items.filter((item) => item.quantityReceived < item.quantityOrdered) : [];

  function submit() {
    if (!selected) {
      return;
    }
    const lines = pendingItems.filter((item) => quantities[item.purchaseOrderItemId]).map((item) => ({ purchaseOrderItemId: item.purchaseOrderItemId, quantityReceived: Number(quantities[item.purchaseOrderItemId]) }));
    if (lines.length === 0) {
      return;
    }

    registerReceiving.mutate(
      { purchaseOrderId: selected.purchaseOrderId, tenantId: selected.tenantId, lines, receivedAt: new Date().toISOString() },
      {
        onSuccess: (registration) => {
          showToast("success", registration.fullyReceived ? "Pedido recebido por completo." : "Recebimento parcial registrado.");
          onLogged(`Recebimento registrado para o Pedido ${selected.purchaseOrderId.slice(0, 8)}${registration.fullyReceived ? " — recebido por completo" : ""}.`);
          if (registration.fullyReceived) {
            onFullyReceived(registration.purchaseOrder);
          }
          setQuantities({});
        },
        onError: () => showToast("danger", "Não foi possível registrar o recebimento."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      {receivable.length === 0 ? (
        <EmptyState title="Nenhum Pedido pronto para recebimento" description="Um Pedido precisa estar Enviado ao Fornecedor antes de registrar um recebimento." />
      ) : (
        <>
          <WidgetCard title="Selecionar Pedido">
            <Select label="Pedido" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              {receivable.map((po) => (
                <option key={po.purchaseOrderId} value={po.purchaseOrderId}>
                  {po.purchaseOrderId.slice(0, 8)} — {po.status}
                </option>
              ))}
            </Select>
          </WidgetCard>

          <WidgetCard title="Recebimentos já registrados">
            {(receivings.data?.length ?? 0) === 0 ? (
              <EmptyState title="Nenhum Recebimento registrado ainda para este Pedido" />
            ) : (
              <div className="dashboard-grid">
                {receivings.data!.map((receiving) => (
                  <ReceivingCard key={receiving.receivingId} receivingId={receiving.receivingId} linesCount={receiving.lines.length} receivedAt={receiving.receivedAt} />
                ))}
              </div>
            )}
          </WidgetCard>

          {alreadyHasReceiving ? (
            <NotConnectedNotice fields={["Um segundo recebimento para o mesmo Pedido"]} context="Purchase Hub (limitação real de Persistência, IMP-302/IMP-303 — nunca contornada nesta camada)" />
          ) : (
            selected &&
            pendingItems.length > 0 && (
              <WidgetCard title="Registrar Recebimento">
                <div className="form-grid">
                  {pendingItems.map((item) => (
                    <Field
                      key={item.purchaseOrderItemId}
                      label={`${item.productId} — pendente: ${item.quantityOrdered - item.quantityReceived}`}
                      type="number"
                      min={0}
                      max={item.quantityOrdered - item.quantityReceived}
                      value={quantities[item.purchaseOrderItemId] ?? ""}
                      onChange={(event) => setQuantities({ ...quantities, [item.purchaseOrderItemId]: event.target.value })}
                    />
                  ))}
                </div>
                <Button type="button" variant="primary" disabled={registerReceiving.isPending} onClick={submit}>
                  Registrar Recebimento
                </Button>
              </WidgetCard>
            )
          )}
        </>
      )}
    </div>
  );
}
