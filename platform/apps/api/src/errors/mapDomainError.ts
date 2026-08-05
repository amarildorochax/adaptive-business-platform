import { ConflictError, HttpError, InternalServerError, NotFoundError, UnprocessableEntityError } from "./HttpError.js";

/**
 * Traduz o que um Manager já aprovado lança — sempre `Error` puro, nunca uma hierarquia de exceção
 * tipada (nenhum Manager, Service ou Repository desta plataforma jamais declarou uma — "nunca
 * alterar Managers/Services" impede que esta Sprint introduza uma agora) — para um `HttpError` com o
 * código correto. A tradução é por reconhecimento do texto da mensagem, porque esse texto já segue
 * uma convenção real e consistente em toda a série IMP/FUN, confirmada por auditoria de código
 * (`FINAL_ARCHITECTURE_COMPLETION_AUDIT.md`, Seção 3: todo `throw new Error` do workspace é validação
 * de regra de negócio em português, no padrão "X não encontrado" / "X já existe" / precondição
 * violada) — nunca uma inferência arbitrária.
 *
 * Esta é uma heurística, documentada como tal em `FUN_004_BACKEND_HTTP_API_REPORT.md` — o mapeamento
 * correto e definitivo exigiria uma hierarquia de exceção tipada no domínio, fora do escopo desta
 * Sprint (proibido alterar Managers/Services). Um Manager cuja mensagem não corresponda a nenhum
 * padrão reconhecido cai em 500 — nunca 400/404/409/422 por suposição.
 */
export function mapDomainError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (!(error instanceof Error)) {
    return new InternalServerError();
  }

  const message = error.message;

  if (/não encontrad[oa]/i.test(message)) {
    return new NotFoundError(message);
  }

  if (/já (existe|possui|está|foi)/i.test(message)) {
    return new ConflictError(message);
  }

  if (/(precisa|deve ser|não pode|obrigat[óo]ri|inválid|nunca é aplicad|apenas.*pode|só pode|nenhum[a]? .*existente|ainda não)/i.test(message)) {
    return new UnprocessableEntityError(message);
  }

  return new InternalServerError();
}
