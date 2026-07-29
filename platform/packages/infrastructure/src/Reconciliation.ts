/**
 * Reconciliation — registro de verificação de Integridade entre Read Model e histórico de Evento de origem.
 * Estrutura, regras e invariantes definidas em DATA_CONCRETE_STRUCTURE.md.
 */
export interface ReconciliationReport {
  /** Nome do conjunto de dado verificado. */
  readonly dataSetName: string;

  /** Momento em que a verificação foi realizada. */
  readonly checkedAt: Date;

  /** Se alguma divergência foi encontrada entre Read Model e histórico de Evento. */
  readonly discrepanciesFound: boolean;
}
