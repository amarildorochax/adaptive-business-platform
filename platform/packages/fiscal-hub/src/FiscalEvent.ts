/**
 * FiscalEvent — os seis Eventos de domínio publicados pelo Fiscal Hub, cada um um Fato já consumado,
 * nunca uma instrução. Conjunto exato de `DOMAIN_EVENT_CATALOG.md`, seção "Fiscal Hub" (idêntico a
 * `FISCAL_HUB.md`, Capítulo 8) — nenhum Evento adicional foi criado por esta Sprint, per instrução
 * explícita desta Sprint ("Nunca inventar eventos").
 *
 * `FiscalObligationOverdue` nunca é publicado por um Command direto — é produzido por
 * `FiscalObligationTrackingService.evaluateOverdue`, a avaliação periódica "acionada pelo Automation
 * Engine, nunca por agendador interno" (Capítulo 10), mesmo padrão de `ReorderRuleTriggered`
 * (Purchase Hub) sendo produzido por `ReorderEvaluationService.evaluate`, não por um Command de
 * usuário.
 *
 * Cada Evento carrega apenas identificadores de correlação, nunca dado de negócio duplicado — mesma
 * disciplina de minimalismo referencial já aplicada por `ProductionEvent`/`InventoryEvent`.
 */
export type FiscalEventType =
  | 'TaxRuleCreated'
  | 'TaxCalculated'
  | 'FiscalDocumentIssued'
  | 'FiscalDocumentCancelled'
  | 'FiscalObligationRegistered'
  | 'FiscalObligationOverdue';

export interface FiscalEvent {
  /** Identificador do Evento. */
  readonly eventId: string;

  /** Tipo do Evento. */
  readonly type: FiscalEventType;

  /** Tax Rule à qual este Evento se refere, apenas em `TaxRuleCreated`/`TaxCalculated`. */
  readonly taxRuleId?: string;

  /** Fiscal Document Line à qual este Evento se refere, apenas em `TaxCalculated`. */
  readonly fiscalDocumentLineId?: string;

  /** Fiscal Document ao qual este Evento se refere, apenas em `FiscalDocumentIssued`/
   * `FiscalDocumentCancelled`. */
  readonly fiscalDocumentId?: string;

  /** Fiscal Obligation à qual este Evento se refere, apenas em `FiscalObligationRegistered`/
   * `FiscalObligationOverdue`. */
  readonly fiscalObligationId?: string;

  /** Momento em que o Fato ocorreu. */
  readonly occurredAt: Date;
}
