import { WidgetCard } from "@shared/components/WidgetCard";
import { ActivityBadge } from "@shared/components/ui/ActivityBadge";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Timeline, type TimelineStep } from "@shared/components/ui/Timeline";
import type { PurchaseHistoryEntry } from "../purchaseHistoryLog";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function toSteps(log: readonly PurchaseHistoryEntry[]): readonly TimelineStep[] {
  return log.map((entry, index) => ({ id: entry.id, label: `${formatDateTime(entry.occurredAt)} — ${entry.message}`, status: index === log.length - 1 ? "current" : "completed" }));
}

/**
 * Histórico (IMP-305) — "Consumir os Events reais. Nunca sintetizar Timeline. Nunca criar eventos
 * fictícios." Mesma disciplina de `HistorySection.tsx` do Supplier Workspace (IMP-205): nenhum
 * endpoint HTTP do Purchase Hub (IMP-303) devolve `PurchaseEvent` — cada handler de
 * `apps/api/src/routes/purchase.ts` extrai apenas `result`, descartando `events`/`command` na
 * própria fronteira HTTP — nenhum Evento de domínio real chega ao Frontend. Este log
 * (`purchaseHistoryLog.ts`, local a este Workspace, nunca a `core/purchase/`) é a gravação honesta,
 * no momento exato em que cada Mutation já confirmada pelo servidor resolve com sucesso, do que
 * genuinamente aconteceu nesta sessão — nunca inventado antes da confirmação.
 */
export function HistorySection({ log }: { readonly log: readonly PurchaseHistoryEntry[] }) {
  const sorted = [...log].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Histórico de PurchaseEvent reais"]} context="Purchase Hub" />

      <WidgetCard title="Atividade desta sessão">
        {log.length === 0 ? <EmptyState title="Nenhuma atividade ainda" description="Toda ação real feita neste Workspace aparece aqui." /> : <Timeline label="Histórico do Purchase Workspace" steps={toSteps(log)} />}
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
