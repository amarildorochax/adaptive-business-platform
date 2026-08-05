import { useCallback, useState } from "react";
import type { StockMovementResponseDto, StockReservationResponseDto } from "@core/inventory-movement/inventoryMovement.dto";

export interface InventoryMovementHistoryEntry {
  readonly id: string;
  readonly message: string;
  readonly occurredAt: string;
}

/**
 * Log de atividade local ao Workspace (IMP-405), nunca a `core/inventory-movement/` — mesma
 * disciplina de `purchaseHistoryLog.ts`/`supplierHistoryLog.ts`: nenhum endpoint HTTP do Inventory
 * Movement Hub (IMP-403) devolve `InventoryEvent` — cada handler de
 * `apps/api/src/routes/inventoryMovement.ts` extrai apenas o resultado do Manager, descartando
 * `events`/`command` na própria fronteira HTTP. Cada entrada aqui é, ainda assim, um fato genuinamente
 * real: construída no exato momento em que uma Mutation já confirmada pelo servidor resolve com
 * sucesso, nunca antes, nunca fabricada.
 *
 * `movements`/`reservations` — extensão além da forma exata de `purchaseHistoryLog.ts`, exigida pela
 * ausência real de qualquer Query tenant-wide neste Hub (ver `inventoryMovementSections.ts`):
 * `InventoryMovementManager` nunca expôs uma forma de listar "todos os Movements"/"todas as
 * Reservations" de um Tenant — a Visão Geral e o Analytics deste Workspace não têm nenhuma fonte real
 * alternativa além do que esta própria sessão do navegador já observou de fato, mesmo princípio já
 * usado por `receivedThisSession` (Purchase Workspace) diante da mesma ausência de Query. `reservations`
 * usa upsert por identificador — uma Reservation muda de status (`Active → Released/ConvertedToMovement`)
 * dentro da mesma sessão, e a versão mais recente deve substituir a anterior, nunca duplicar.
 */
export function useInventoryMovementHistoryLog() {
  const [entries, setEntries] = useState<readonly InventoryMovementHistoryEntry[]>([]);
  const [movements, setMovements] = useState<readonly StockMovementResponseDto[]>([]);
  const [reservations, setReservations] = useState<readonly StockReservationResponseDto[]>([]);
  const nextId = useState(() => ({ current: 0 }))[0];

  const append = useCallback(
    (message: string) => {
      nextId.current += 1;
      setEntries((current) => [...current, { id: `inventory-movement-history-${nextId.current}`, message, occurredAt: new Date().toISOString() }]);
    },
    [nextId],
  );

  const recordMovement = useCallback((movement: StockMovementResponseDto) => {
    setMovements((current) => [...current, movement]);
  }, []);

  const upsertReservation = useCallback((reservation: StockReservationResponseDto) => {
    setReservations((current) =>
      current.some((existing) => existing.reservationId === reservation.reservationId)
        ? current.map((existing) => (existing.reservationId === reservation.reservationId ? reservation : existing))
        : [...current, reservation],
    );
  }, []);

  return { entries, append, movements, recordMovement, reservations, upsertReservation };
}
