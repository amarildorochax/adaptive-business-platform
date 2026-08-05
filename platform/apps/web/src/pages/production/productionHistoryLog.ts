import { useCallback, useState } from "react";
import type { ProductionOrderResponseDto } from "@core/production/production.dto";

export interface ProductionHistoryEntry {
  readonly id: string;
  readonly message: string;
  readonly occurredAt: string;
}

/**
 * Log de atividade local ao Workspace (IMP-505), nunca a `core/production/` — mesma disciplina de
 * `inventoryMovementHistoryLog.ts`/`purchaseHistoryLog.ts`/`supplierHistoryLog.ts`: nenhum endpoint
 * HTTP do Production Hub (IMP-503) devolve `ProductionEvent` — cada handler de
 * `apps/api/src/routes/production.ts` extrai apenas o resultado do Manager, descartando
 * `events`/`command` na própria fronteira HTTP. Cada entrada aqui é, ainda assim, um fato genuinamente
 * real: construída no exato momento em que uma Mutation já confirmada pelo servidor resolve com
 * sucesso, nunca antes, nunca fabricada.
 *
 * `productionOrders` — mesma extensão além da forma exata de `purchaseHistoryLog.ts`, exigida pela
 * ausência real de qualquer Query tenant-wide para `ProductionOrder` neste Hub (ver
 * `productionSections.ts`): nem `ProductionManager` nem `apps/api/src/routes/production.ts` jamais
 * expuseram uma forma de listar "todas as ProductionOrder" de um Tenant — a Visão Geral e o Analytics
 * deste Workspace não têm nenhuma fonte real alternativa além do que esta própria sessão do navegador
 * já observou de fato, mesmo princípio já usado por `movements`/`reservations`
 * (`inventoryMovementHistoryLog.ts`) diante da mesma ausência de Query. Upsert por identificador — uma
 * ProductionOrder muda de status (`Planned → InProgress → Completed | Cancelled`) dentro da mesma
 * sessão, e a versão mais recente deve substituir a anterior, nunca duplicar.
 */
export function useProductionHistoryLog() {
  const [entries, setEntries] = useState<readonly ProductionHistoryEntry[]>([]);
  const [productionOrders, setProductionOrders] = useState<readonly ProductionOrderResponseDto[]>([]);
  const nextId = useState(() => ({ current: 0 }))[0];

  const append = useCallback(
    (message: string) => {
      nextId.current += 1;
      setEntries((current) => [...current, { id: `production-history-${nextId.current}`, message, occurredAt: new Date().toISOString() }]);
    },
    [nextId],
  );

  const upsertProductionOrder = useCallback((order: ProductionOrderResponseDto) => {
    setProductionOrders((current) =>
      current.some((existing) => existing.productionOrderId === order.productionOrderId)
        ? current.map((existing) => (existing.productionOrderId === order.productionOrderId ? order : existing))
        : [...current, order],
    );
  }, []);

  return { entries, append, productionOrders, upsertProductionOrder };
}
