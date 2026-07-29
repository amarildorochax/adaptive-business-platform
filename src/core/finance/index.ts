// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo finance — o Finance Intelligence
// completo (Finance, FinanceManager, FinanceService, FinanceStore,
// RevenueRecord, ExpenseRecord, CashFlowRecord, FinancialSnapshot,
// FinanceMetrics, e os contratos futuros FinancePersistenceAdapter/
// PaymentProvider/InvoiceProvider/AccountingProvider/TaxProvider).
//
// Consumidores fora deste módulo devem preferir `finance` (fachada) —
// nunca FinanceManager/FinanceService/FinanceStore diretamente.

export * from './Finance';
export * from './FinanceManager';
export * from './FinanceService';
export * from './FinanceStore';
export * from './RevenueRecord';
export * from './ExpenseRecord';
export * from './CashFlowRecord';
export * from './FinancialSnapshot';
export * from './FinanceMetrics';
export * from './FinancePersistenceAdapter';
export * from './PaymentProvider';
export * from './InvoiceProvider';
export * from './AccountingProvider';
export * from './TaxProvider';
