import { Activity, Banknote, Gauge, Rocket } from "lucide-react";
import { AsyncState } from "@shared/components/AsyncState";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { StatCard } from "@shared/components/StatCard";
import { WidgetCard } from "@shared/components/WidgetCard";
import { useDashboardBootstrap } from "@core/query/useDashboardBootstrap";
import { AnalyticsWidget } from "./AnalyticsWidget";
import { AutomationWidget } from "./AutomationWidget";
import { BrandingWidget } from "./BrandingWidget";
import { BusinessProfileWidget } from "./BusinessProfileWidget";
import { CommunicationWidget } from "./CommunicationWidget";
import { CRMWidget } from "./CRMWidget";
import { KnowledgeWidget } from "./KnowledgeWidget";

/**
 * Visão geral (UX-001 — reorganização puramente visual sobre a FUN-001) — alimentada pelos mesmos
 * sete domínios reais de sempre, através dos mesmos Managers, nunca dado estático/inventado.
 *
 * KPIs no topo respondem "Quanto vendi hoje?"/"Minha meta está sendo atingida?" com o único dado
 * real disponível hoje (nenhum Manager de CRM/Analytics ainda expõe agregação — cada valor é o
 * último Command já executado, nunca uma soma inventada); "Tenho alertas?"/"O que a IA recomenda?"
 * não têm resposta honesta ainda (nenhuma Entidade de Alerta ou recomendação de IA está conectada ao
 * Frontend) — deliberadamente omitidos, nunca fabricados (ver relatório desta Sprint, Seção
 * "Limitações"). "Atividade recente" reaproveita os mesmos campos já exibidos pelos widgets
 * individuais, apenas reagrupados como um resumo do dia.
 */
export function DashboardPage() {
  const bootstrap = useDashboardBootstrap();

  return (
    <PageContainer>
      <PageHeader title="Visão Geral" description="Resumo do dia — pipeline, execuções e identidade da Empresa, direto dos domínios já conectados." />
      <AsyncState isLoading={bootstrap.isLoading} isError={bootstrap.isError} error={bootstrap.error} onRetry={() => void bootstrap.refetch()}>
        {bootstrap.data && (
          <>
            <div className="dashboard-kpis">
              <StatCard icon={<Banknote size={16} aria-hidden="true" />} label="Oportunidade em Aberto" value={`R$ ${bootstrap.data.opportunity.value.toLocaleString("pt-BR")}`} />
              <StatCard icon={<Gauge size={16} aria-hidden="true" />} label="Receita do Mês" value={`R$ ${bootstrap.data.metric.value.toLocaleString("pt-BR")}`} />
              <StatCard icon={<Rocket size={16} aria-hidden="true" />} label="KPI Consolidado" value={bootstrap.data.kpi.value.toLocaleString("pt-BR")} />
              <StatCard icon={<Activity size={16} aria-hidden="true" />} label="Última Execução" value={bootstrap.data.execution.status} />
            </div>

            <div className="dashboard-grid dashboard-grid--wide">
              <div className="dashboard-section">
                <div className="dashboard-section__header">
                  <h2>Quem precisa da minha atenção hoje?</h2>
                </div>
                <CRMWidget snapshot={bootstrap.data} />
              </div>

              <div className="dashboard-section">
                <div className="dashboard-section__header">
                  <h2>Atividade recente</h2>
                </div>
                <WidgetCard title="Últimas atividades">
                  <ul className="activity-list">
                    <ActivityItem title={`Nova mensagem: ${bootstrap.data.message.content}`} meta={`Conversa ${bootstrap.data.conversation.status}`} />
                    <ActivityItem title={`Execução concluída: ${bootstrap.data.workflow.name}`} meta={bootstrap.data.execution.status} />
                    <ActivityItem title={`Novo Lead: ${bootstrap.data.lead.name}`} meta={bootstrap.data.lead.source} />
                  </ul>
                </WidgetCard>
              </div>
            </div>

            <div className="dashboard-grid">
              <BusinessProfileWidget profileId={bootstrap.data.profileId} />
              <BrandingWidget />
              <CommunicationWidget snapshot={bootstrap.data} />
              <AnalyticsWidget snapshot={bootstrap.data} />
              <AutomationWidget snapshot={bootstrap.data} />
              <KnowledgeWidget snapshot={bootstrap.data} />
            </div>
          </>
        )}
      </AsyncState>
    </PageContainer>
  );
}

function ActivityItem({ title, meta }: { readonly title: string; readonly meta: string }) {
  return (
    <li className="activity-item">
      <span className="activity-item__icon" aria-hidden="true">
        <Activity size={15} />
      </span>
      <span className="activity-item__body">
        <span className="activity-item__title">{title}</span>
        <span className="activity-item__meta">{meta}</span>
      </span>
    </li>
  );
}
