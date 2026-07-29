// useCrmKpis.ts
//
// Responsabilidade:
// Hook do Painel CRM — combina `useClients`/`useCompanies`/`useDeals`/
// `usePipelineStages`/`useActivities` e computa os 8 KPIs via
// `CrmKpiService` (transformação pura).

import { useMemo } from 'react';
import { useClients } from './useClients';
import { useCompanies } from './useCompanies';
import { useDeals } from './useDeals';
import { usePipelineStages } from './usePipelineStages';
import { useActivities } from './useActivities';
import { crmKpiService } from '../services';
import type { CrmKpis } from '../contracts';

export interface UseCrmKpisResult {
  kpis: CrmKpis;
  loading: boolean;
}

export function useCrmKpis(): UseCrmKpisResult {
  const clients = useClients();
  const companies = useCompanies();
  const deals = useDeals();
  const stages = usePipelineStages();
  const activities = useActivities();

  const loading = clients.loading || companies.loading || deals.loading || stages.loading || activities.loading;

  const kpis = useMemo(
    () => crmKpiService.compute(clients.data, companies.data, deals.data, stages.data, activities.data),
    [clients.data, companies.data, deals.data, stages.data, activities.data],
  );

  return { kpis, loading };
}
