/** Categoria de falha de uma operação de IA — nunca um erro específico de provider. */
export type AIErrorCode =
  | "INVALID_REQUEST"
  | "PROVIDER_NOT_FOUND"
  | "PROVIDER_NOT_IMPLEMENTED"
  | "PROVIDER_ERROR"
  | "TIMEOUT"
  | "UNKNOWN";

interface AIErrorParams {
  code: AIErrorCode;
  message: string;
  provider?: string;
  retryable?: boolean;
  cause?: unknown;
}

/**
 * Erro unificado de toda a camada de IA (Tarefa 08 — Tratamento
 * Unificado de Erros).
 *
 * Responsabilidade: ser o único tipo de erro que atravessa AIGateway,
 * AIRouter, AIProviderFactory, e qualquer AIProvider — nenhum erro
 * específico de provider (ex.: um erro de rede do SDK da OpenAI) deve
 * escapar dessa camada sem antes ser convertido para AIError via
 * `toAIError()`. `BaseAIProvider.generate()` já garante essa conversão
 * para qualquer provider que o estenda.
 *
 * `retryable` é apenas informativo nesta Sprint — nenhum mecanismo de
 * retry real consome este campo ainda (ver AIRequestOptions.ts,
 * Tarefa 11).
 */
export class AIError extends Error {
  readonly code: AIErrorCode;
  readonly provider?: string;
  readonly retryable: boolean;
  readonly cause?: unknown;

  constructor(params: AIErrorParams) {
    super(params.message);

    this.name = "AIError";
    this.code = params.code;
    this.provider = params.provider;
    this.retryable = params.retryable ?? false;
    this.cause = params.cause;
  }
}

/**
 * Converte qualquer erro (de provider, de rede, ou já um AIError) em um
 * AIError — idempotente: se `error` já for um AIError, é retornado sem
 * alteração.
 */
export function toAIError(error: unknown, provider?: string): AIError {
  if (error instanceof AIError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);

  return new AIError({
    code: "PROVIDER_ERROR",
    message,
    provider,
    cause: error,
  });
}
