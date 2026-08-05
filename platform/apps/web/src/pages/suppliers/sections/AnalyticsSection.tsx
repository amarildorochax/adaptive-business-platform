import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import type { SupplierResponseDto } from "@core/supplier/supplier.dto";

/**
 * Analytics (IMP-205) — "Mostrar indicadores derivados dos dados existentes. Nunca criar
 * recomendações de IA. Nunca criar gráficos sem dados." Todo indicador aqui é uma agregação direta
 * de `useSuppliers` (lista real, com `contacts` embutido) — nenhuma IA, nenhum gráfico sem dado
 * real por trás. Indicador de custo médio/giro de Fornecedor exigiria a listagem de
 * `SupplierCatalogItem`/`SupplierPerformanceRecord`, indisponível (nenhum `GET` existe, ver
 * `ContractsSection`/`CatalogSection`) — `NotConnectedNotice` explica.
 */
export function AnalyticsSection({ suppliers }: { readonly suppliers: readonly SupplierResponseDto[] }) {
  if (suppliers.length === 0) {
    return (
      <div className="dashboard-section">
        <EmptyState title="Nenhum dado ainda" description="Cadastre ao menos um Fornecedor para ver indicadores." />
      </div>
    );
  }

  const active = suppliers.filter((supplier) => supplier.status === "Active");
  const withContacts = suppliers.filter((supplier) => supplier.contacts.length > 0);
  const activeShare = Math.round((active.length / suppliers.length) * 100);

  const categoryCounts = new Map<string, number>();
  for (const supplier of suppliers) {
    const category = supplier.supplyCategory ?? "Sem categoria";
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }

  return (
    <div className="dashboard-section">
      <KPIGrid>
        <MetricCard label="Taxa de Fornecedores ativos" value={`${activeShare}%`} tone="success" hint={`${active.length} de ${suppliers.length}`} />
        <MetricCard label="Com ao menos um Contato" value={String(withContacts.length)} tone="info" hint={`de ${suppliers.length} Fornecedores`} />
        <MetricCard label="Categorias distintas" value={String(categoryCounts.size)} tone="neutral" />
      </KPIGrid>

      <WidgetCard title="Distribuição por Categoria de Fornecimento">
        <ul className="activity-log-list">
          {[...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).map(([category, count]) => (
            <li key={category}>
              <span>{category}</span>
              <span>{count} Fornecedor(es)</span>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <NotConnectedNotice fields={["Custo médio por Fornecedor", "Lead time consolidado", "Desempenho de entrega"]} context="Supplier Hub" />
    </div>
  );
}
