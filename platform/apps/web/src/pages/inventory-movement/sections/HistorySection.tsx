import { WidgetCard } from "@shared/components/WidgetCard";
import { ActivityBadge } from "@shared/components/ui/ActivityBadge";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Timeline, type TimelineStep } from "@shared/components/ui/Timeline";
import type { InventoryMovementHistoryEntry } from "../inventoryMovementHistoryLog";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function toSteps(log: readonly InventoryMovementHistoryEntry[]): readonly TimelineStep[] {
  return log.map((entry, index) => ({ id: entry.id, label: `${formatDateTime(entry.occurredAt)} — ${entry.message}`, status: index === log.length - 1 ? "current" : "completed" }));
}

/**
 * Histórico (IMP-405) — "Organizar os eventos reais cronologicamente. Nunca sintetizar Timeline."
 * Mesma disciplina de `HistorySection.tsx` do Purchase/Supplier Workspace: nenhum endpoint HTTP do
 * Inventory Movement Hub (IMP-403) devolve `InventoryEvent` — este log (`inventoryMovementHistoryLog.ts`,
 * local a este Workspace, nunca a `core/inventory-movement/`) é a gravação honesta, no momento exato
 * em que cada Mutation já confirmada pelo servidor resolve com sucesso, do que genuinamente aconteceu
 * nesta sessão.
 *
 * "Explorar melhor o histórico operacional" (per instrução explícita desta Sprint) — o resumo por
 * categoria abaixo do Timeline é uma contagem real sobre as mesmas entradas já exibidas, nunca um dado
 * adicional inventado; cada entrada de `log` já nasce com uma categoria implícita reconhecível por
 * palavra-chave da própria mensagem (todas escritas por este Workspace, nunca por texto arbitrário de
 * usuário) — uma forma simples e honesta de organizar o mesmo dado real já coletado, sem introduzir
 * nenhum novo estado.
 */
export function HistorySection({ log }: { readonly log: readonly InventoryMovementHistoryEntry[] }) {
  const sorted = [...log].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const movementEntries = log.filter((entry) => entry.message.startsWith("Movimentação"));
  const reservationEntries = log.filter((entry) => entry.message.startsWith("Reserva"));
  const otherEntries = log.length - movementEntries.length - reservationEntries.length;

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Histórico de InventoryEvent reais"]} context="Inventory Movement Hub" />

      {log.length > 0 && (
        <WidgetCard title="Resumo desta sessão">
          <ul className="activity-log-list">
            <li>
              <span>Movimentações registradas</span>
              <span>{movementEntries.length}</span>
            </li>
            <li>
              <span>Ações sobre Reservas</span>
              <span>{reservationEntries.length}</span>
            </li>
            <li>
              <span>Outras ações (Localizações, Alertas)</span>
              <span>{otherEntries}</span>
            </li>
          </ul>
        </WidgetCard>
      )}

      <WidgetCard title="Atividade desta sessão">
        {log.length === 0 ? <EmptyState title="Nenhuma atividade ainda" description="Toda ação real feita neste Workspace aparece aqui." /> : <Timeline label="Histórico do Inventory Movement Workspace" steps={toSteps(log)} />}
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
