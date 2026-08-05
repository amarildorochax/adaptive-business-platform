import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import type { PurchaseOrderResponseDto } from "@core/purchase/purchase.dto";

function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currencyCode }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Analytics (IMP-305) — "Mostrar somente métricas derivadas dos dados existentes. Nunca criar
 * gráficos fictícios." Todo indicador aqui é uma agregação direta de `usePurchaseOrders` (lista real
 * de Purchase Order abertos, `core/purchase/`, IMP-304) — nenhuma IA, nenhum gráfico sem dado real
 * por trás. Desempenho de entrega/lead time consolidado exigiria `SupplierPerformanceRecord`
 * (Supplier Hub — fora da fronteira do Purchase Hub, `core/purchase/` nunca importa tipo de
 * `@abp/supplier-hub`) — `NotConnectedNotice` explica.
 */
export function AnalyticsSection({ purchaseOrders }: { readonly purchaseOrders: readonly PurchaseOrderResponseDto[] }) {
  if (purchaseOrders.length === 0) {
    return (
      <div className="dashboard-section">
        <EmptyState title="Nenhum dado ainda" description="Crie ao menos um Pedido para ver indicadores." />
      </div>
    );
  }

  const statusCounts = new Map<string, number>();
  const supplierCounts = new Map<string, number>();
  const valueByCurrency = new Map<string, number>();
  let totalItems = 0;

  for (const purchaseOrder of purchaseOrders) {
    statusCounts.set(purchaseOrder.status, (statusCounts.get(purchaseOrder.status) ?? 0) + 1);
    supplierCounts.set(purchaseOrder.supplierId, (supplierCounts.get(purchaseOrder.supplierId) ?? 0) + 1);
    totalItems += purchaseOrder.items.length;

    for (const item of purchaseOrder.items) {
      const current = valueByCurrency.get(item.acquisitionCost.currencyCode) ?? 0;
      valueByCurrency.set(item.acquisitionCost.currencyCode, current + item.acquisitionCost.amount * item.quantityOrdered);
    }
  }

  const avgItemsPerOrder = (totalItems / purchaseOrders.length).toFixed(1);

  return (
    <div className="dashboard-section">
      <KPIGrid>
        <MetricCard label="Pedidos abertos" value={String(purchaseOrders.length)} tone="primary" />
        <MetricCard label="Fornecedores distintos" value={String(supplierCounts.size)} tone="info" />
        <MetricCard label="Média de itens por Pedido" value={avgItemsPerOrder} tone="neutral" />
      </KPIGrid>

      <WidgetCard title="Valor total em Pedidos abertos">
        {valueByCurrency.size === 0 ? (
          <EmptyState title="Nenhum item com custo informado ainda" />
        ) : (
          <ul className="activity-log-list">
            {[...valueByCurrency.entries()].map(([currencyCode, amount]) => (
              <li key={currencyCode}>
                <span>{currencyCode}</span>
                <span>{formatCurrency(amount, currencyCode)}</span>
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>

      <WidgetCard title="Distribuição por Status">
        <ul className="activity-log-list">
          {[...statusCounts.entries()].sort((a, b) => b[1] - a[1]).map(([status, count]) => (
            <li key={status}>
              <span>{status}</span>
              <span>{count} Pedido(s)</span>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard title="Distribuição por Fornecedor">
        <ul className="activity-log-list">
          {[...supplierCounts.entries()].sort((a, b) => b[1] - a[1]).map(([supplierId, count]) => (
            <li key={supplierId}>
              <span>Fornecedor {supplierId.slice(0, 8)}</span>
              <span>{count} Pedido(s)</span>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <NotConnectedNotice fields={["Desempenho de entrega por Fornecedor", "Lead time consolidado"]} context="Purchase Hub (dado pertence ao Supplier Hub, fora da fronteira deste domínio)" />
    </div>
  );
}
