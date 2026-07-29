// index.ts
//
// Responsabilidade:
// Ponto único de exportação do módulo business-intelligence — o
// Business Intelligence Engine completo (BusinessIntelligence,
// BusinessIntelligenceManager, BusinessIntelligenceService,
// BusinessIntelligenceStore, Insight, Recommendation, Trend,
// BusinessIntelligenceMetrics, BusinessIntelligenceAutomationProvider
// (Sprint 20), BusinessIntelligenceAutomationMetrics, e os contratos
// futuros ForecastProvider/MLProvider/AIInsightProvider).
//
// Nota (Etapa 24A — Correção 03): `BusinessIntelligenceStore` deixou de
// ser reexportado por este barrel — verificado que nenhum consumidor
// fora deste módulo o importava, e a classe não define nenhum tipo
// público adicional. `BusinessIntelligenceManager`/
// `BusinessIntelligenceService` permanecem exportados: `Service.ts`
// define, no mesmo arquivo, o tipo público `AnalysisResult` — removê-lo
// seria inseguro.
//
// Consumidores fora deste módulo devem preferir `businessIntelligence`
// (fachada) — nunca BusinessIntelligenceManager/
// BusinessIntelligenceService/BusinessIntelligenceStore diretamente.
// `businessIntelligenceAutomationProvider` é a exceção: não há uma
// fachada mais alta para ele (ver Automation Center, Sprint 14, para o
// mesmo padrão de Provider já usado antes).

export * from './BusinessIntelligence';
export * from './BusinessIntelligenceManager';
export * from './BusinessIntelligenceService';
export * from './Insight';
export * from './Recommendation';
export * from './Trend';
export * from './BusinessIntelligenceMetrics';
export * from './BusinessIntelligenceAutomationProvider';
export * from './BusinessIntelligenceAutomationMetrics';
export * from './ForecastProvider';
export * from './MLProvider';
export * from './AIInsightProvider';
