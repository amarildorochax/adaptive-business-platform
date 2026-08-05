/**
 * Erro do cliente HTTP — nunca a mensagem técnica original é exibida na UI (`toUserMessage()`),
 * mesma disciplina de "nunca retornar stack trace"/"nunca exibir mensagens técnicas" já aplicada no
 * lado do servidor (`apps/api/src/errors/HttpError.ts`, FUN-004). `code`/`correlationId` preservam o
 * corpo padronizado que `apps/api`'s `errorHandler` já produz — nunca reinventado aqui, apenas lido.
 */
export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly correlationId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  /** Mensagem segura para exibição — nunca a mensagem de domínio original (que pode conter detalhe interno). */
  toUserMessage(): string {
    switch (this.statusCode) {
      case 400:
        return "Dado inválido. Verifique as informações enviadas.";
      case 401:
        return "Credenciais inválidas ou sessão expirada.";
      case 404:
        return "Registro não encontrado.";
      case 409:
        return "Este registro já existe ou está em conflito com outro já existente.";
      case 422:
        return "Não foi possível concluir a operação — uma condição de negócio não foi satisfeita.";
      default:
        return "Ocorreu um erro inesperado. Tente novamente em instantes.";
    }
  }
}

/** Erro de rede/timeout — nunca chegou a receber uma resposta HTTP (distinto de `ApiError`, que sempre carrega um `statusCode` real). */
export class ApiNetworkError extends Error {
  constructor(message = "Não foi possível conectar à API. Verifique sua conexão.") {
    super(message);
    this.name = "ApiNetworkError";
  }
}
