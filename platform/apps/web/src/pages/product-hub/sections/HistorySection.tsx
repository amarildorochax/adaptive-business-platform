import { WidgetCard } from "@shared/components/WidgetCard";
import { ActivityBadge, type ActivityBadgeTone } from "@shared/components/ui/ActivityBadge";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Timeline, type TimelineStep } from "@shared/components/ui/Timeline";
import type { ProductEventLogEntry, ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const TONE: Partial<Record<string, ActivityBadgeTone>> = { ProductCreated: "primary", ProductUpdated: "info", PriceChanged: "success", StockUpdated: "warning" };

function toSteps(log: readonly ProductEventLogEntry[]): readonly TimelineStep[] {
  const sorted = [...log].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  return sorted.map((entry, index) => ({ id: entry.id, label: `${formatDateTime(entry.occurredAt)} — ${entry.label}`, status: index === sorted.length - 1 ? "current" : "completed" }));
}

/**
 * Histórico (FUN-104) — reutiliza o componente `Timeline` do Design System (primeiro uso: Jornada de
 * Construção do Perfil, FUN-101). Diferente da Timeline Comercial do CRM Workspace (FUN-103, um log
 * sintetizado no navegador, já que `CRMEvent` nunca sobrevive à fronteira HTTP), aqui cada entrada é
 * um `CommerceEvent` genuinamente real — `CommerceManager` é consumido em processo nesta Sprint
 * (nenhuma API própria existe para o Commerce Hub, ver relatório desta Sprint), então o próprio
 * Evento (não apenas uma etiqueta) chega inteiro ao Frontend. Nunca publicado em nenhum Event Bus
 * (nenhum existe na plataforma) — apenas coletado, mesmo estado já documentado desde a IMP-006.
 */
export function HistorySection({ workspace }: { readonly workspace: ProductWorkspaceSnapshot }) {
  const sorted = [...workspace.eventLog].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return (
    <div className="dashboard-section">
      <WidgetCard title="Histórico de Eventos (CommerceEvent reais)">
        {workspace.eventLog.length === 0 ? <EmptyState title="Nenhum evento ainda" /> : <Timeline label="Histórico do Product Hub" steps={toSteps(workspace.eventLog)} />}
      </WidgetCard>

      {sorted.length > 0 && (
        <WidgetCard title="Detalhe por evento">
          <ul className="activity-log-list">
            {sorted.map((entry) => (
              <li key={entry.id}>
                <ActivityBadge label={entry.type} tone={TONE[entry.type] ?? "neutral"} />
                <span>{entry.label}</span>
                <span className="activity-log-list__time">{formatDateTime(entry.occurredAt)}</span>
              </li>
            ))}
          </ul>
        </WidgetCard>
      )}
    </div>
  );
}
