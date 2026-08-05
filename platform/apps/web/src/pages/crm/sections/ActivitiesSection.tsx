import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";

/**
 * Atividades (FUN-103) — `Activity`/`Task` existem como contratos de tipo (`packages/crm-hub/src/
 * Activity.ts`/`Task.ts`), mas nenhum `ActivityManager`/`TaskManager` foi implementado — `CRMManager`
 * não expõe nenhum dos oito métodos com um Task ou uma Activity (ver auditoria do relatório desta
 * Sprint). Nenhum dos onze Commands já Frozen (`CreateTask`/`CompleteTask` incluídos) tem
 * implementação real ainda (`CRM_CORE_MIGRATION_REPORT.md`, "Componentes Ainda Pendentes"). Página
 * inteiramente placeholder — nunca uma persistência inventada.
 */
export function ActivitiesSection() {
  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Tarefas", "Follow-ups", "Ligações", "Emails", "Reuniões", "Pendências"]} context="CRM Hub" />
      <WidgetCard title="Atividades">
        <EmptyState title="Nenhuma Atividade disponível" description="O CRM Hub ainda não implementa Activity Manager nem Task Manager — nenhum dado real existe para esta seção." />
      </WidgetCard>
    </div>
  );
}
