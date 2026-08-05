import { WidgetCard } from "@shared/components/WidgetCard";
import { ActivityBadge, type ActivityBadgeTone } from "@shared/components/ui/ActivityBadge";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Timeline, type TimelineStep } from "@shared/components/ui/Timeline";
import type { CrmActivityLogEntry, CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function classify(entry: CrmActivityLogEntry): { readonly tag: string; readonly tone: ActivityBadgeTone } {
  const label = entry.label.toLowerCase();
  if (label.includes("ganha") || label.includes("convertido")) return { tag: "Ganho", tone: "success" };
  if (label.includes("perdida")) return { tag: "Perda", tone: "danger" };
  if (label.includes("movida") || label.includes("atualizado")) return { tag: "Mudança", tone: "info" };
  return { tag: "Criação", tone: "primary" };
}

function toSteps(log: readonly CrmActivityLogEntry[]): readonly TimelineStep[] {
  const sorted = [...log].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  return sorted.map((entry, index) => ({ id: entry.id, label: `${formatDateTime(entry.occurredAt)} — ${entry.label}`, status: index === sorted.length - 1 ? "current" : "completed" }));
}

/**
 * Timeline Comercial (FUN-103) — reutiliza o componente `Timeline` do Design System (primeiro uso:
 * Jornada de Construção do Perfil, FUN-101). **Nunca a Timeline real do Relationship**: `CRMManager`
 * grava um `TimelineEvent` real a cada Command (`timeline.record(...)`), mas não expõe nenhuma Query
 * para lê-lo de volta, e `apps/api` também nunca devolve `CRMEvent[]` pela HTTP (ver relatório desta
 * Sprint, "A Limitação Central"). O que esta seção mostra é o log de atividade construído inteiramente
 * no navegador, a partir do que o próprio usuário fez nesta sessão — nunca apresentado como histórico
 * persistido no servidor.
 */
export function TimelineSection({ workspace }: { readonly workspace: CrmWorkspaceSnapshot }) {
  const sorted = [...workspace.activityLog].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Timeline real do Relationship (persistida no servidor)"]} context="CRM Hub" />

      <WidgetCard title="Timeline Comercial (registro local desta sessão)">
        <Timeline label="Timeline Comercial" steps={toSteps(workspace.activityLog)} />
      </WidgetCard>

      <WidgetCard title="Detalhe por evento">
        <ul className="activity-log-list">
          {sorted.map((entry) => {
            const { tag, tone } = classify(entry);
            return (
              <li key={entry.id}>
                <ActivityBadge label={tag} tone={tone} />
                <span>{entry.label}</span>
                <span className="activity-log-list__time">{formatDateTime(entry.occurredAt)}</span>
              </li>
            );
          })}
        </ul>
      </WidgetCard>
    </div>
  );
}
