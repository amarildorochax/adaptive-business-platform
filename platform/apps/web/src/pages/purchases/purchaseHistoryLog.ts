import { useCallback, useState } from "react";
import type { PurchaseOrderResponseDto } from "@core/purchase/purchase.dto";

export interface PurchaseHistoryEntry {
  readonly id: string;
  readonly message: string;
  readonly occurredAt: string;
}

/**
 * Log de atividade local ao Workspace (IMP-305), nunca a `core/purchase/` — mesma disciplina de
 * `supplierHistoryLog.ts` (IMP-205): nenhum endpoint HTTP do Purchase Hub (IMP-303) devolve
 * `PurchaseEvent` — cada handler de `apps/api/src/routes/purchase.ts` extrai apenas `result` do
 * retorno do Manager, descartando `events` na própria fronteira HTTP — então nenhum Evento de
 * domínio real chega ao Frontend. Cada entrada aqui é, ainda assim, um fato genuinamente real:
 * construída no exato momento em que uma Mutation já confirmada pelo servidor resolve com sucesso,
 * nunca antes, nunca fabricada. Nunca persistida além da sessão do navegador.
 *
 * `receivedThisSession`/`markReceived` — extensão pequena e justificada além da forma exata de
 * `supplierHistoryLog.ts`, exigida pelo Purchase Hub e sem equivalente no Supplier Hub:
 * `PurchaseManager` nunca expôs nenhuma Query para listar Purchase Order por status individual
 * (`findByStatus` existe apenas no Repository Interface, IMP-302 — nunca no Manager, IMP-301) —
 * "Recebido" nem sequer aparece em `listOpenPurchaseOrders` (que só retorna os status "abertos").
 * Não existe, portanto, nenhuma forma de consultar quantos Purchase Order já foram genuinamente
 * finalizados nesta sessão a não ser rastreando-os localmente, no exato momento em que uma
 * `registerReceiving` real confirma `fullyReceived: true` — nunca uma contagem fabricada, apenas o
 * mesmo dado real já devolvido pela Mutation, mantido em memória do navegador. Usado pela etapa
 * "Finalizado" do `ProcessFlow` em `OverviewSection.tsx`. Documentado em
 * `IMP_305_PURCHASE_WORKSPACE_REPORT.md`.
 */
export function usePurchaseHistoryLog() {
  const [entries, setEntries] = useState<readonly PurchaseHistoryEntry[]>([]);
  const [receivedThisSession, setReceivedThisSession] = useState<readonly PurchaseOrderResponseDto[]>([]);
  const nextId = useState(() => ({ current: 0 }))[0];

  const append = useCallback(
    (message: string) => {
      nextId.current += 1;
      setEntries((current) => [...current, { id: `purchase-history-${nextId.current}`, message, occurredAt: new Date().toISOString() }]);
    },
    [nextId],
  );

  const markReceived = useCallback((purchaseOrder: PurchaseOrderResponseDto) => {
    setReceivedThisSession((current) => (current.some((po) => po.purchaseOrderId === purchaseOrder.purchaseOrderId) ? current : [...current, purchaseOrder]));
  }, []);

  return { entries, append, receivedThisSession, markReceived };
}
