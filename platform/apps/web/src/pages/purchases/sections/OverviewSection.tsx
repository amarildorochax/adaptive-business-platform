import { ClipboardCheck, PackageCheck, ShoppingCart, Truck } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { LiveIndicator } from "@shared/components/ui/LiveIndicator";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { ProcessFlow, type ProcessFlowStep } from "@shared/components/ui/ProcessFlow";
import { PurchaseOrderCard } from "@shared/components/ui/PurchaseOrderCard";
import { useRecentlyChanged } from "@shared/hooks/useRecentlyChanged";
import type { PurchaseOrderResponseDto } from "@core/purchase/purchase.dto";
import { usePurchaseRequisitions } from "@core/purchase/usePurchaseRequisitions";

const IN_PROGRESS_STATUSES = new Set(["Draft", "PendingApproval", "Approved", "Sent"]);

function stepStatus(hasHere: boolean, hasAhead: boolean): ProcessFlowStep["status"] {
  if (hasAhead) {
    return "completed";
  }
  return hasHere ? "current" : "pending";
}

function buildProcurementFlow(
  openRequisitionsCount: number,
  approvedRequisitionsCount: number,
  inProgressOrdersCount: number,
  partiallyReceivedCount: number,
  finalizedThisSession: number,
): readonly ProcessFlowStep[] {
  const pastRequest = approvedRequisitionsCount > 0 || inProgressOrdersCount > 0 || partiallyReceivedCount > 0 || finalizedThisSession > 0;
  const pastApproval = inProgressOrdersCount > 0 || partiallyReceivedCount > 0 || finalizedThisSession > 0;
  const pastOrder = partiallyReceivedCount > 0 || finalizedThisSession > 0;
  const pastReceiving = finalizedThisSession > 0;

  return [
    { id: "request", label: "Solicitação", status: stepStatus(openRequisitionsCount > 0, pastRequest), detail: `${openRequisitionsCount} aberta(s)` },
    { id: "approval", label: "Aprovação", status: stepStatus(approvedRequisitionsCount > 0, pastApproval), detail: `${approvedRequisitionsCount} aprovada(s)` },
    { id: "order", label: "Pedido", status: stepStatus(inProgressOrdersCount > 0, pastOrder), detail: `${inProgressOrdersCount} em andamento` },
    { id: "receiving", label: "Recebimento", status: stepStatus(partiallyReceivedCount > 0, pastReceiving), detail: `${partiallyReceivedCount} parcial(is)` },
    { id: "finished", label: "Finalizado", status: finalizedThisSession > 0 ? "completed" : "pending", detail: `${finalizedThisSession} nesta sessão` },
  ];
}

/**
 * Visão Geral (IMP-305; `ProcessFlow`/`LiveIndicator` desde a UX-002) — dashboard operacional real.
 * Diferente do Supplier Workspace (uma única Query de topo, `useSuppliers`, por o Supplier Hub ter
 * apenas uma Query real em Core), o Purchase Hub expõe seis Queries reais espalhadas por três
 * Aggregates distintos — esta seção soma `openOrders` (recebido via prop, `usePurchaseOrders` já
 * carregado por `PurchasePage.tsx`) a duas Queries próprias (`usePurchaseRequisitions` para os
 * status "Open"/"Approved"), co-localizadas aqui por serem específicas desta seção; React Query
 * deduplica por `queryKey`, então nenhuma chamada de rede duplicada ocorre quando outra seção
 * (Requisições) também consulta o mesmo status. Decisão documentada em
 * `IMP_305_PURCHASE_WORKSPACE_REPORT.md`, "Arquitetura Utilizada".
 *
 * `ProcessFlow` resume o funil real de Procurement — Solicitação → Aprovação → Pedido → Recebimento
 * → Finalizado — cada etapa e cada `detail` calculados exclusivamente a partir de dado real, nunca
 * fabricado. "Finalizado" usa `receivedThisSession` (`purchaseHistoryLog.ts`) — `PurchaseManager`
 * nunca expôs nenhuma Query para Purchase Order já Recebido (limite documentado naquele arquivo),
 * então a contagem reflete apenas o que esta sessão do navegador observou de fato, nunca um total
 * histórico inventado. `LiveIndicator` acende quando `dataUpdatedAt` (React Query, timestamp real da
 * última resposta do servidor para `openOrders`) muda.
 */
export function OverviewSection({
  tenantId,
  openOrders,
  dataUpdatedAt,
  receivedThisSession,
}: {
  readonly tenantId: string;
  readonly openOrders: readonly PurchaseOrderResponseDto[];
  readonly dataUpdatedAt: number;
  readonly receivedThisSession: readonly PurchaseOrderResponseDto[];
}) {
  const openRequisitions = usePurchaseRequisitions(tenantId, "Open");
  const approvedRequisitions = usePurchaseRequisitions(tenantId, "Approved");
  const justUpdated = useRecentlyChanged(dataUpdatedAt);

  const inProgressOrders = openOrders.filter((po) => IN_PROGRESS_STATUSES.has(po.status));
  const partiallyReceivedOrders = openOrders.filter((po) => po.status === "PartiallyReceived");
  const recent = [...openOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  const flow = buildProcurementFlow(
    openRequisitions.data?.length ?? 0,
    approvedRequisitions.data?.length ?? 0,
    inProgressOrders.length,
    partiallyReceivedOrders.length,
    receivedThisSession.length,
  );

  return (
    <div className="dashboard-section">
      <WidgetCard title="Funil de Procurement">
        <ProcessFlow label="Progresso do Procurement" steps={flow} />
      </WidgetCard>

      <KPIGrid>
        <MetricCard label="Pedidos abertos" value={String(openOrders.length)} icon={<ShoppingCart size={16} aria-hidden="true" />} tone="primary" />
        <MetricCard label="Requisições aguardando aprovação" value={String(openRequisitions.data?.length ?? 0)} icon={<ClipboardCheck size={16} aria-hidden="true" />} tone="warning" />
        <MetricCard label="Em recebimento" value={String(partiallyReceivedOrders.length)} icon={<PackageCheck size={16} aria-hidden="true" />} tone="info" />
        <MetricCard label="Finalizados nesta sessão" value={String(receivedThisSession.length)} icon={<Truck size={16} aria-hidden="true" />} tone="success" />
      </KPIGrid>
      {justUpdated && <LiveIndicator />}

      <WidgetCard title="Pedidos recentes">
        {recent.length === 0 ? (
          <EmptyState title="Nenhum Purchase Order criado ainda" description="Crie o primeiro Pedido na aba 'Pedidos'." />
        ) : (
          <div className="dashboard-grid">
            {recent.map((purchaseOrder) => (
              <PurchaseOrderCard
                key={purchaseOrder.purchaseOrderId}
                purchaseOrderId={purchaseOrder.purchaseOrderId}
                supplierId={purchaseOrder.supplierId}
                status={purchaseOrder.status}
                itemsCount={purchaseOrder.items.length}
              />
            ))}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
