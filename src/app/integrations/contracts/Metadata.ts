// Metadata.ts
//
// Responsabilidade:
// Metadados de rastreabilidade anexados a toda `CoreRequest`/
// `CoreResponse` — preparação para Observabilidade (Sprint 30), sem
// nenhuma integração real de logs/tracing/metrics ainda.

export interface RequestMetadata {
  correlationId?: string;
  requestId?: string;
  issuedAt?: string;
}

export interface ResponseMetadata {
  correlationId?: string;
  requestId?: string;
  receivedAt?: string;
  durationMs?: number;
}
