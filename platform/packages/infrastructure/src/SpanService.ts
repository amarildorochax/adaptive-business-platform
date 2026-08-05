import type { CorrelationId } from "./CorrelationId.js";
import type { Span } from "./Span.js";
import type { SpanRepository } from "./SpanRepository.js";

/** Span aberto, ainda em processamento — nunca persistido até `finish()` (ver `SpanRepository`). */
export interface OpenSpan {
  readonly correlationId: CorrelationId;
  readonly module: string;
  readonly startedAt: Date;
}

/**
 * Span Service — "Tracing conecta o processamento de uma requisição de ponta a ponta, através de
 * múltiplos módulos" (`NON_FUNCTIONAL_REQUIREMENTS.md`, Capítulo 9). `getTrace` é a própria
 * composição que forma um Distributed Trace — nunca um Repository ou uma Entity separada.
 */
export class SpanService {
  constructor(private readonly repository: SpanRepository) {}

  start(correlationId: CorrelationId, module: string): OpenSpan {
    return { correlationId, module, startedAt: new Date() };
  }

  async finish(open: OpenSpan): Promise<Span> {
    const span: Span = { ...open, finishedAt: new Date() };
    return this.repository.create(span);
  }

  /** Distributed Trace: a composição ordenada de todos os Spans com o mesmo Correlation ID. */
  async getTrace(correlationId: CorrelationId): Promise<readonly Span[]> {
    const spans = await this.repository.listByCorrelationId(correlationId);
    return [...spans].sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
  }
}
