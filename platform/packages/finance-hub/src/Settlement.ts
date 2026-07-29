/**
 * Settlement — o processo de liquidação financeira entre a plataforma e o Provider de pagamento,
 * tipicamente consolidando múltiplos Payment em um único repasse; nunca altera Ledger já existente —
 * produz seu próprio registro, referenciando os Payment e Ledger Entry já existentes (Blueprint,
 * ADR-010).
 * Estrutura definida em `FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 7.
 */
export interface Settlement {
  /** Identificador do Settlement. */
  readonly settlementId: string;

  /** Tenant ao qual este Settlement pertence. */
  readonly tenantId: string;

  /** Payments consolidados neste repasse. */
  readonly paymentIds: readonly string[];

  /** Se o Settlement já foi confirmado. */
  readonly completed: boolean;

  /** Momento do registro. */
  readonly registeredAt: Date;
}
