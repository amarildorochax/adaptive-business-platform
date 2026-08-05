import { WidgetCard } from "@shared/components/WidgetCard";
import type { DemoSnapshot } from "@core/managers/seedDemoData";

export function AnalyticsWidget({ snapshot }: { readonly snapshot: DemoSnapshot }) {
  return (
    <WidgetCard title="Analytics — Métricas">
      <dl>
        <dt>Dashboard</dt>
        <dd>{snapshot.dashboard.name}</dd>
        <dt>{snapshot.metric.name}</dt>
        <dd>R$ {snapshot.metric.value.toLocaleString("pt-BR")}</dd>
        <dt>KPI</dt>
        <dd>{snapshot.kpi.value.toLocaleString("pt-BR")}</dd>
      </dl>
    </WidgetCard>
  );
}
