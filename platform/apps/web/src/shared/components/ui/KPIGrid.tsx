import type { ReactNode } from "react";

export interface KPIGridProps {
  readonly children: ReactNode;
}

/** Grade responsiva de indicadores (`MetricCard`/`StatCard`) — primeiro uso no CRM Workspace (FUN-103), genérico para qualquer dashboard de domínio. */
export function KPIGrid({ children }: KPIGridProps) {
  return <div className="kpi-grid">{children}</div>;
}
