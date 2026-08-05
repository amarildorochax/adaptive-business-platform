import { WidgetCard } from "@shared/components/WidgetCard";
import { ActivityBadge } from "@shared/components/ui/ActivityBadge";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Timeline, type TimelineStep } from "@shared/components/ui/Timeline";
import type { ProductionHistoryEntry } from "../productionHistoryLog";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function toSteps(log: readonly ProductionHistoryEntry[]): readonly TimelineStep[] {
  return log.map((entry, index) => ({ id: entry.id, label: `${formatDateTime(entry.occurredAt)} — ${entry.message}`, status: index === log.length - 1 ? "current" : "completed" }));
}

/**
 * Histórico (IMP-505) — "Organizar os eventos reais cronologicamente. Nunca sintetizar Timeline."
 * Mesma disciplina de `HistorySection.tsx` do Inventory Movement/Purchase/Supplier Workspace: nenhum
 * endpoint HTTP do Production Hub (IMP-503) devolve `ProductionEvent` — este log
 * (`productionHistoryLog.ts`, local a este Workspace, nunca a `core/production/`) é a gravação
 * honesta, no momento exato em que cada Mutation já confirmada pelo servidor resolve com sucesso, do
 * que genuinamente aconteceu nesta sessão.
 */
export function HistorySection({ log }: { readonly log: readonly ProductionHistoryEntry[] }) {
  const sorted = [...log].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const orderEntries = log.filter((entry) => entry.message.startsWith("Ordem") || entry.message.startsWith("Consumo") || entry.message.startsWith("Geração"));
  const bomEntries = log.filter((entry) => entry.message.startsWith("Composição"));
  const otherEntries = log.length - orderEntries.length - bomEntries.length;

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Histórico de ProductionEvent reais"]} context="Production Hub" />

      {log.length > 0 && (
        <WidgetCard title="Resumo desta sessão">
          <ul className="activity-log-list">
            <li>
              <span>Ações sobre Ordens de Produção</span>
              <span>{orderEntries.length}</span>
            </li>
            <li>
              <span>Ações sobre Composições (BOM)</span>
              <span>{bomEntries.length}</span>
            </li>
            <li>
              <span>Outras ações (Centros de Trabalho)</span>
              <span>{otherEntries}</span>
            </li>
          </ul>
        </WidgetCard>
      )}

      <WidgetCard title="Atividade desta sessão">
        {log.length === 0 ? <EmptyState title="Nenhuma atividade ainda" description="Toda ação real feita neste Workspace aparece aqui." /> : <Timeline label="Histórico do Production Workspace" steps={toSteps(log)} />}
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
