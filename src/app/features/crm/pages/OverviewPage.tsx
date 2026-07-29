// OverviewPage.tsx
//
// Responsabilidade:
// "Painel" do CRM — os 8 KPIs exigidos pelo ESCOPO (`useCrmKpis`) mais um
// resumo do Histórico recente (`Timeline`, via `useHistory`), demonstrando
// que a trilha de auditoria ("nada poderá ser perdido") já está
// disponível como fundação, mesmo sem uma tela de detalhe de registro
// nesta Sprint.

import { Stack, Grid, Text } from '@/app/primitives';
import { Loading } from '@/design-system/components';
import { CRMCard, Timeline } from '../components';
import { useCrmKpis } from '../hooks/useCrmKpis';
import { useHistory } from '../hooks/useHistory';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function OverviewPage() {
  const { kpis, loading } = useCrmKpis();
  const history = useHistory();

  if (loading) {
    return <Loading label="Carregando indicadores do CRM…" />;
  }

  const kpiCards: { label: string; value: string }[] = [
    { label: 'Total de Clientes', value: String(kpis.totalClients) },
    { label: 'Total de Empresas', value: String(kpis.totalCompanies) },
    { label: 'Leads Ativos', value: String(kpis.totalLeads) },
    { label: 'Negócios em Andamento', value: String(kpis.totalDeals) },
    { label: 'Receita Prevista', value: formatCurrency(kpis.expectedRevenue) },
    { label: 'Receita Realizada', value: formatCurrency(kpis.realizedRevenue) },
    { label: 'Taxa de Conversão', value: formatPercent(kpis.conversionRate) },
    { label: 'Follow-ups Pendentes', value: String(kpis.pendingFollowUps) },
  ];

  return (
    <Stack gap={24}>
      <Grid columns={4} gap={16} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {kpiCards.map((card) => (
          <CRMCard key={card.label}>
            <Stack gap={4}>
              <Text variant="caption" color="var(--ads-color-text-auxiliary)">
                {card.label}
              </Text>
              <Text variant="body" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {card.value}
              </Text>
            </Stack>
          </CRMCard>
        ))}
      </Grid>

      <CRMCard title="Histórico Recente">
        {history.loading ? <Loading size="sm" label="Carregando histórico…" /> : <Timeline entries={history.data} />}
      </CRMCard>
    </Stack>
  );
}
