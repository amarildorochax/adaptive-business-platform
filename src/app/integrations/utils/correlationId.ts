// correlationId.ts
//
// Responsabilidade:
// Geração de identificadores de correlação/requisição — suporte real
// (não um contrato vazio) para o preenchimento de
// `RequestMetadata.correlationId`/`requestId`, usado pelos Hooks a cada
// chamada.

export function createCorrelationId(): string {
  return crypto.randomUUID();
}

export function createRequestId(): string {
  return crypto.randomUUID();
}
