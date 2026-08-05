import type { CorrelationId } from "./CorrelationId.js";
import type { Span } from "./Span.js";

/**
 * Span Repository — um Span só é persistido já concluído (ver `SpanService.finish`); nunca `update`
 * nem `remove`. `listByCorrelationId` é a base para compor o Distributed Trace, que nunca é
 * armazenado separadamente ("Um Distributed Trace é a composição de múltiplos Spans com o mesmo
 * Correlation ID", `Span.ts`).
 */
export interface SpanRepository {
  create(span: Span): Promise<Span>;
  listByCorrelationId(correlationId: CorrelationId): Promise<readonly Span[]>;
}
