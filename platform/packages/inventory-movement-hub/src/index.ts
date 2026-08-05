/**
 * Barrel export do pacote @abp/inventory-movement-hub.
 * IMP-401 — Inventory Movement Hub Core. Reexporta cada contrato de domínio implementado nesta Sprint.
 * Fakes de teste nunca são exportados aqui — apenas pelo subpath `./testing`, ver `package.json`.
 */
export * from './InventoryCommand';
export * from './InventoryDomainError';
export * from './InventoryEvent';
export * from './InventoryFactory';
export * from './InventoryMovementManager';
export * from './InventoryPolicy';
export * from './InventoryValidator';
export * from './MovementOrigin';
export * from './QuantityDelta';
export * from './StockAlertEvaluationService';
export * from './StockAlertRule';
export * from './StockAlertRuleRepository';
export * from './StockLocation';
export * from './StockLocationRepository';
export * from './StockLocationService';
export * from './StockMovement';
export * from './StockMovementRecordingService';
export * from './StockMovementRepository';
export * from './StockPosition';
export * from './StockPositionProjectionService';
export * from './StockPositionRepository';
export * from './StockReservation';
export * from './StockReservationRepository';
export * from './StockReservationService';
