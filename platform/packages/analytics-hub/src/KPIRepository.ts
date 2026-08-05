import type { KPI } from './KPI';

/** Contrato de persistência de KPI — apenas o contrato. `update` existe porque `KPIUpdated` representa recálculo, nunca redefinição arbitrária (KPIs Are Derived, Blueprint ADR-003). */
export interface KPIRepository {
  create(kpi: KPI): Promise<KPI>;
  update(kpi: KPI): Promise<KPI>;
  get(kpiId: string): Promise<KPI | undefined>;
  list(tenantId: string): Promise<KPI[]>;
}
