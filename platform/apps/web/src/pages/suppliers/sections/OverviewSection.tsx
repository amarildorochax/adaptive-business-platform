import { CheckCircle2, PauseCircle, Users2 } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { LiveIndicator } from "@shared/components/ui/LiveIndicator";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { ProcessFlow, type ProcessFlowStep } from "@shared/components/ui/ProcessFlow";
import { SupplierCard } from "@shared/components/ui/SupplierCard";
import { useRecentlyChanged } from "@shared/hooks/useRecentlyChanged";
import type { SupplierResponseDto } from "@core/supplier/supplier.dto";

function buildOperationalFlow(suppliers: readonly SupplierResponseDto[]): readonly ProcessFlowStep[] {
  const total = suppliers.length;
  const withContacts = suppliers.filter((supplier) => supplier.contacts.length > 0).length;
  const active = suppliers.filter((supplier) => supplier.status === "Active").length;

  return [
    { id: "registered", label: "Cadastro", status: total > 0 ? "completed" : "current", detail: `${total} Fornecedor(es)` },
    {
      id: "contacts",
      label: "Contato associado",
      status: total === 0 ? "pending" : withContacts === total ? "completed" : withContacts > 0 ? "current" : "pending",
      detail: total > 0 ? `${withContacts} de ${total}` : undefined,
    },
    {
      id: "operational",
      label: "Operacional",
      status: total === 0 ? "pending" : active === total ? "completed" : active > 0 ? "current" : "blocked",
      detail: total > 0 ? `${active} de ${total} ativos` : undefined,
    },
  ];
}

/**
 * Visão Geral (IMP-205; `ProcessFlow`/`LiveIndicator` desde a UX-002) — dashboard operacional real,
 * quatro KPIs derivados exclusivamente de `GET /suppliers/by-tenant/:tenantId` (`useSuppliers`,
 * `core/supplier/`, IMP-204): total, ativos, desabilitados e total de Contatos já associados (soma
 * de `contacts.length`, embutido em cada Supplier). `MetricCard`/`KPIGrid` reutilizados sem
 * alteração — nenhum "SupplierMetricCard"/"SupplierOverviewCard" foi criado, per decisão
 * documentada em `IMP_205_SUPPLIER_WORKSPACE_REPORT.md`, "Componentes Reutilizados": os dois já
 * cobrem exatamente esta necessidade, um componente exclusivo seria redundante.
 *
 * `ProcessFlow` (UX-002, "Fluxos Visuais") resume, em uma única cadeia visual, o quão longe a
 * operação real de Fornecedores já avançou — Cadastro → Contato associado → Operacional — cada
 * etapa e cada `detail` calculados exclusivamente a partir de `suppliers` real, nunca fabricados;
 * "Operacional" cai em `blocked` apenas quando genuinamente nenhum Fornecedor cadastrado está
 * Ativo, um alerta operacional real. `LiveIndicator` acende por alguns segundos sempre que
 * `suppliers.dataUpdatedAt` (React Query, timestamp real da última resposta do servidor) muda —
 * nunca um cronômetro decorativo.
 */
export function OverviewSection({ suppliers, dataUpdatedAt }: { readonly suppliers: readonly SupplierResponseDto[]; readonly dataUpdatedAt: number }) {
  const active = suppliers.filter((supplier) => supplier.status === "Active");
  const disabled = suppliers.filter((supplier) => supplier.status === "Disabled");
  const totalContacts = suppliers.reduce((sum, supplier) => sum + supplier.contacts.length, 0);
  const recent = [...suppliers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);
  const justUpdated = useRecentlyChanged(dataUpdatedAt);

  return (
    <div className="dashboard-section">
      <WidgetCard title="Fluxo Operacional">
        <ProcessFlow label="Progresso operacional dos Fornecedores" steps={buildOperationalFlow(suppliers)} />
      </WidgetCard>

      <KPIGrid>
        <MetricCard label="Fornecedores" value={String(suppliers.length)} icon={<Users2 size={16} aria-hidden="true" />} tone="primary" />
        <MetricCard label="Ativos" value={String(active.length)} icon={<CheckCircle2 size={16} aria-hidden="true" />} tone="success" />
        <MetricCard label="Desabilitados" value={String(disabled.length)} icon={<PauseCircle size={16} aria-hidden="true" />} tone="neutral" />
        <MetricCard label="Contatos associados" value={String(totalContacts)} tone="info" />
      </KPIGrid>
      {justUpdated && <LiveIndicator />}

      <WidgetCard title="Cadastrados recentemente">
        {recent.length === 0 ? (
          <EmptyState title="Nenhum Fornecedor cadastrado ainda" description="Cadastre o primeiro Fornecedor na aba 'Fornecedores'." />
        ) : (
          <div className="dashboard-grid">
            {recent.map((supplier) => (
              <SupplierCard key={supplier.supplierId} legalName={supplier.legalName} status={supplier.status} taxId={supplier.taxId} supplyCategory={supplier.supplyCategory} contactsCount={supplier.contacts.length} />
            ))}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
