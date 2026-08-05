import { useCallback, useState } from "react";

export interface SupplierHistoryEntry {
  readonly id: string;
  readonly message: string;
  readonly occurredAt: string;
}

/**
 * Log de atividade local ao Workspace (IMP-205), nunca a `core/supplier/` — instrução explícita
 * desta Sprint proíbe alterar a Frontend Infrastructure já aprovada (IMP-204), que não expõe
 * nenhum mecanismo de acumulação de histórico. Nenhum endpoint HTTP do Supplier Hub (IMP-203)
 * devolve `SupplierEvent` — `events` é descartado na própria fronteira HTTP (ver
 * `apps/api/src/routes/supplier.ts`) — então nenhum Evento de domínio real chega ao Frontend.
 *
 * Cada entrada aqui é, ainda assim, um fato genuinamente real: construída no exato momento em que
 * uma Mutation já confirmada pelo servidor resolve com sucesso, nunca antes, nunca fabricada. Nunca
 * persistida além da sessão do navegador (nenhum `localStorage`, nenhuma sincronização com o
 * servidor) — mesma disciplina já aplicada ao "Timeline Comercial" do CRM Workspace (FUN-103) e
 * documentada como limitação honesta em cada relatório desde então.
 */
export function useSupplierHistoryLog() {
  const [entries, setEntries] = useState<readonly SupplierHistoryEntry[]>([]);
  const nextId = useState(() => ({ current: 0 }))[0];

  const append = useCallback(
    (message: string) => {
      nextId.current += 1;
      setEntries((current) => [...current, { id: `supplier-history-${nextId.current}`, message, occurredAt: new Date().toISOString() }]);
    },
    [nextId],
  );

  return { entries, append };
}
