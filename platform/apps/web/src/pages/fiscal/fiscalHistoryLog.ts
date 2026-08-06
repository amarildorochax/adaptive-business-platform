import { useCallback, useState } from "react";
import type { FiscalDocumentResponseDto, TaxRuleResponseDto } from "@core/fiscal/fiscal.dto";

export interface FiscalHistoryEntry {
  readonly id: string;
  readonly message: string;
  readonly occurredAt: string;
}

/**
 * Log de atividade local ao Workspace (IMP-605), nunca a `core/fiscal/` — mesma disciplina de
 * `productionHistoryLog.ts`/`inventoryMovementHistoryLog.ts`/`purchaseHistoryLog.ts`/
 * `supplierHistoryLog.ts`: nenhum endpoint HTTP do Fiscal Hub (IMP-603) devolve `FiscalEvent` — cada
 * handler de `apps/api/src/routes/fiscal.ts` extrai apenas o resultado do Manager, descartando
 * `events`/`command` na própria fronteira HTTP. Cada entrada aqui é, ainda assim, um fato genuinamente
 * real: construída no exato momento em que uma Mutation já confirmada pelo servidor resolve com
 * sucesso, nunca antes, nunca fabricada.
 *
 * `taxRules`/`fiscalDocuments` — mesma extensão além da forma exata de `productionHistoryLog.ts`
 * (`productionOrders`), exigida pela ausência real de Query de listagem tenant-wide para `TaxRule`
 * (nenhum `GET /tax-rules` existe, IMP-603) e da mesma ausência para `FiscalDocument` (apenas
 * `GET /fiscal-documents/:id`/`by-origin`, nunca "listar todos"). Upsert por identificador — uma
 * `TaxRule`/`FiscalDocument` muda de estado dentro da mesma sessão (`active`/`status`), e a versão mais
 * recente deve substituir a anterior, nunca duplicar.
 *
 * `taxCalculationsCount`/`fiscalObligationsRegisteredCount` são contadores, nunca arrays completos —
 * `TaxCalculation` não possui nenhuma Query em nenhuma camada (Core/HTTP/Frontend Infrastructure,
 * confirmado por `IMP_604_FISCAL_FRONTEND_INFRASTRUCTURE_REPORT.md`, Seção "Derived Data"), então
 * manter uma lista completa aqui seria armazenar um dado que nenhuma tela jamais volta a consultar;
 * `FiscalObligation` já possui duas Query reais de listagem (`usePendingFiscalObligations`/
 * `useOverdueFiscalObligations`, consultadas diretamente por `FiscalObligationsSection.tsx`) — este
 * contador alimenta exclusivamente o KPI "Obrigações registradas nesta sessão" da Visão Geral, nunca
 * duplica a fonte real de listagem.
 */
export function useFiscalHistoryLog() {
  const [entries, setEntries] = useState<readonly FiscalHistoryEntry[]>([]);
  const [taxRules, setTaxRules] = useState<readonly TaxRuleResponseDto[]>([]);
  const [fiscalDocuments, setFiscalDocuments] = useState<readonly FiscalDocumentResponseDto[]>([]);
  const [taxCalculationsCount, setTaxCalculationsCount] = useState(0);
  const [fiscalObligationsRegisteredCount, setFiscalObligationsRegisteredCount] = useState(0);
  const nextId = useState(() => ({ current: 0 }))[0];

  const append = useCallback(
    (message: string) => {
      nextId.current += 1;
      setEntries((current) => [...current, { id: `fiscal-history-${nextId.current}`, message, occurredAt: new Date().toISOString() }]);
    },
    [nextId],
  );

  const upsertTaxRule = useCallback((rule: TaxRuleResponseDto) => {
    setTaxRules((current) => (current.some((existing) => existing.taxRuleId === rule.taxRuleId) ? current.map((existing) => (existing.taxRuleId === rule.taxRuleId ? rule : existing)) : [...current, rule]));
  }, []);

  const upsertFiscalDocument = useCallback((document: FiscalDocumentResponseDto) => {
    setFiscalDocuments((current) =>
      current.some((existing) => existing.fiscalDocumentId === document.fiscalDocumentId)
        ? current.map((existing) => (existing.fiscalDocumentId === document.fiscalDocumentId ? document : existing))
        : [...current, document],
    );
  }, []);

  const recordTaxCalculation = useCallback(() => setTaxCalculationsCount((current) => current + 1), []);
  const recordFiscalObligationRegistered = useCallback(() => setFiscalObligationsRegisteredCount((current) => current + 1), []);

  return {
    entries,
    append,
    taxRules,
    upsertTaxRule,
    fiscalDocuments,
    upsertFiscalDocument,
    taxCalculationsCount,
    recordTaxCalculation,
    fiscalObligationsRegisteredCount,
    recordFiscalObligationRegistered,
  };
}
