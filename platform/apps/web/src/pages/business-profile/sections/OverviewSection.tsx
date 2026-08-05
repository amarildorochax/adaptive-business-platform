import { Calendar, Gauge, Layers, ShieldCheck } from "lucide-react";
import { AsyncState } from "@shared/components/AsyncState";
import { StatCard } from "@shared/components/StatCard";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Timeline, type TimelineStep } from "@shared/components/ui/Timeline";
import { useBusinessProfile } from "@core/query/useBusinessProfile";
import { useBusinessProfileSummary } from "@core/query/useBusinessProfileSummary";

const JOURNEY_STAGES = ["Cadastro", "Perguntas Iniciais", "Classificação", "Validação", "Perfil Inicial"] as const;

function buildJourney(currentStage: string | undefined): readonly TimelineStep[] {
  const currentIndex = currentStage ? JOURNEY_STAGES.indexOf(currentStage as (typeof JOURNEY_STAGES)[number]) : -1;

  return JOURNEY_STAGES.map((stage, index) => ({
    id: stage,
    label: stage,
    status: currentIndex === -1 ? "pending" : index < currentIndex ? "completed" : index === currentIndex ? "current" : "pending",
  }));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/**
 * Visão Geral (FUN-101) — inteiramente real: Segmento/Subsegmento/Maturidade/Estágio via
 * `useBusinessProfileSummary` (já existente, FUN-005), Data de criação via `useBusinessProfile`
 * (novo hook desta Sprint, mesmo endpoint `GET /business-profiles/by-tenant/:tenantId` já existente
 * desde a FUN-004). A Jornada (Timeline) é reconstruída a partir do único estágio atual devolvido
 * pela API, posicionado dentro da sequência fixa e já documentada de cinco estágios (Capítulo 9) —
 * nenhum histórico de transição é inventado.
 */
export function OverviewSection({ profileId, tenantId }: { readonly profileId: string; readonly tenantId: string }) {
  const summary = useBusinessProfileSummary(profileId);
  const profile = useBusinessProfile(tenantId);

  const isLoading = summary.isLoading || profile.isLoading;
  const isError = summary.isError || profile.isError;

  return (
    <AsyncState isLoading={isLoading} isError={isError} error={summary.error ?? profile.error} onRetry={() => { void summary.refetch(); void profile.refetch(); }}>
      {summary.data && (
        <div className="dashboard-section">
          <div className="dashboard-kpis">
            <StatCard icon={<Layers size={16} aria-hidden="true" />} label="Segmento" value={summary.data.classification?.segment ?? "—"} />
            <StatCard icon={<Gauge size={16} aria-hidden="true" />} label="Maturidade" value={summary.data.maturity ?? "—"} />
            <StatCard icon={<ShieldCheck size={16} aria-hidden="true" />} label="Estágio" value={summary.data.stage ?? "—"} />
            <StatCard icon={<Calendar size={16} aria-hidden="true" />} label="Perfil criado em" value={profile.data ? formatDate(profile.data.createdAt) : "—"} />
          </div>

          <div className="dashboard-grid dashboard-grid--wide">
            <WidgetCard title="Resumo executivo">
              <p>
                Empresa classificada como <strong>{summary.data.classification?.segment ?? "segmento não classificado"}</strong>
                {summary.data.classification?.subsegment ? ` (${summary.data.classification.subsegment})` : ""}, com maturidade digital <strong>{summary.data.maturity ?? "não avaliada"}</strong>. A Jornada de
                Construção do Perfil está no estágio <strong>{summary.data.stage ?? "não iniciado"}</strong>.
              </p>
            </WidgetCard>

            <WidgetCard title="Jornada de Construção do Perfil">
              <Timeline label="Estágios da Jornada de Construção do Perfil" steps={buildJourney(summary.data.stage)} />
            </WidgetCard>
          </div>
        </div>
      )}
    </AsyncState>
  );
}
