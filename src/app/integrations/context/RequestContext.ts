// RequestContext.ts
//
// Responsabilidade:
// Identificadores de rastreabilidade de uma execução de pipeline —
// preenchidos por `CorrelationIdMiddleware`/`RequestIdMiddleware`
// (únicos middlewares desta Sprint com efeito real, ambos triviais:
// apenas geram um id quando ausente).

export interface RequestContext {
  correlationId: string;
  requestId: string;
  issuedAt: string;
}
