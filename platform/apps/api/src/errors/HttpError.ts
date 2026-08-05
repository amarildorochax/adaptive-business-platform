/**
 * Hierarquia de erro HTTP desta camada de transporte — nunca uma exceção de domínio. Nenhum Manager,
 * Service ou Repository já aprovado lança `HttpError`; esta classe existe exclusivamente para o
 * `errorHandler` (`plugins/errorHandler.ts`) saber qual código HTTP e qual corpo padronizado
 * devolver, sem jamais propagar a Exception interna original (mensagem, stack) ao cliente.
 */
export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message, "BAD_REQUEST");
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(401, message, "UNAUTHORIZED");
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message, "NOT_FOUND");
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message, "CONFLICT");
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message: string) {
    super(422, message, "UNPROCESSABLE_ENTITY");
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Erro interno do servidor.") {
    super(500, message, "INTERNAL_SERVER_ERROR");
  }
}
