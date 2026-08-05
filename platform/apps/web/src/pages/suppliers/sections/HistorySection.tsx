import { WidgetCard } from "@shared/components/WidgetCard";
import { ActivityBadge } from "@shared/components/ui/ActivityBadge";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Timeline, type TimelineStep } from "@shared/components/ui/Timeline";
import type { SupplierHistoryEntry } from "../supplierHistoryLog";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function toSteps(log: readonly SupplierHistoryEntry[]): readonly TimelineStep[] {
  return log.map((entry, index) => ({ id: entry.id, label: `${formatDateTime(entry.occurredAt)} — ${entry.message}`, status: index === log.length - 1 ? "current" : "completed" }));
}

/**
 * Histórico (IMP-205) — "Consumir os Events reais. Nunca sintetizar Timeline. Nunca criar eventos
 * fictícios." Nenhum endpoint HTTP do Supplier Hub (IMP-203) devolve `SupplierEvent` —
 * `events` é descartado na própria fronteira HTTP (`apps/api/src/routes/supplier.ts`, cada handler
 * extrai apenas `{ result }`), então nenhum Evento de domínio real chega jamais ao Frontend. Este
 * log (`supplierHistoryLog.ts`, local a este Workspace, nunca a `core/supplier/`) não é uma
 * Timeline sintetizada nem um evento fictício — é a gravação honesta, no momento exato em que cada
 * Mutation já confirmada pelo servidor resolve com sucesso, do que genuinamente aconteceu nesta
 * sessão; nunca inventado antes da confirmação, nunca reconstruído de trás para frente. Diferente
 * do Histórico do Product Hub (FUN-104), que consome `CommerceEvent` real porque `CommerceManager`
 * roda em processo — aqui o próprio `SupplierEvent` nunca atravessa a fronteira HTTP, limitação
 * documentada em `IMP_205_SUPPLIER_WORKSPACE_REPORT.md`.
 */
export function HistorySection({ log }: { readonly log: readonly SupplierHistoryEntry[] }) {
  const sorted = [...log].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Histórico de SupplierEvent reais"]} context="Supplier Hub" />

      <WidgetCard title="Atividade desta sessão">
        {log.length === 0 ? <EmptyState title="Nenhuma atividade ainda" description="Toda ação real feita neste Workspace aparece aqui." /> : <Timeline label="Histórico do Supplier Workspace" steps={toSteps(log)} />}
      </WidgetCard>

      {sorted.length > 0 && (
        <WidgetCard title="Detalhe por atividade">
          <ul className="activity-log-list">
            {sorted.map((entry) => (
              <li key={entry.id}>
                <ActivityBadge label="Ação" tone="info" />
                <span>{entry.message}</span>
                <span className="activity-log-list__time">{formatDateTime(entry.occurredAt)}</span>
              </li>
            ))}
          </ul>
        </WidgetCard>
      )}
    </div>
  );
}
