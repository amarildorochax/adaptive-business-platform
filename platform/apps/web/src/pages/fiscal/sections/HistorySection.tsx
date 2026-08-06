import { WidgetCard } from "@shared/components/WidgetCard";
import { ActivityBadge } from "@shared/components/ui/ActivityBadge";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Timeline, type TimelineStep } from "@shared/components/ui/Timeline";
import type { FiscalHistoryEntry } from "../fiscalHistoryLog";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function toSteps(log: readonly FiscalHistoryEntry[]): readonly TimelineStep[] {
  return log.map((entry, index) => ({ id: entry.id, label: `${formatDateTime(entry.occurredAt)} — ${entry.message}`, status: index === log.length - 1 ? "current" : "completed" }));
}

/**
 * Histórico (IMP-605) — "Organizar os eventos reais cronologicamente. Nunca sintetizar Timeline."
 * Mesma disciplina de `HistorySection.tsx` do Production/Inventory Movement/Purchase/Supplier
 * Workspace: nenhum endpoint HTTP do Fiscal Hub (IMP-603) devolve `FiscalEvent` — este log
 * (`fiscalHistoryLog.ts`, local a este Workspace, nunca a `core/fiscal/`) é a gravação honesta, no
 * momento exato em que cada Mutation já confirmada pelo servidor resolve com sucesso, do que
 * genuinamente aconteceu nesta sessão.
 */
export function HistorySection({ log }: { readonly log: readonly FiscalHistoryEntry[] }) {
  const sorted = [...log].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const regimeAndRuleEntries = log.filter((entry) => entry.message.startsWith("Regime") || entry.message.startsWith("Tax Rule"));
  const documentEntries = log.filter((entry) => entry.message.startsWith("Documento"));
  const otherEntries = log.length - regimeAndRuleEntries.length - documentEntries.length;

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Histórico de FiscalEvent reais"]} context="Fiscal Hub" />

      {log.length > 0 && (
        <WidgetCard title="Resumo desta sessão">
          <ul className="activity-log-list">
            <li>
              <span>Ações sobre Regime & Tax Rule</span>
              <span>{regimeAndRuleEntries.length}</span>
            </li>
            <li>
              <span>Ações sobre Documentos Fiscais</span>
              <span>{documentEntries.length}</span>
            </li>
            <li>
              <span>Outras ações (Cálculo/Obrigações)</span>
              <span>{otherEntries}</span>
            </li>
          </ul>
        </WidgetCard>
      )}

      <WidgetCard title="Atividade desta sessão">
        {log.length === 0 ? <EmptyState title="Nenhuma atividade ainda" description="Toda ação real feita neste Workspace aparece aqui." /> : <Timeline label="Histórico do Fiscal Workspace" steps={toSteps(log)} />}
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
