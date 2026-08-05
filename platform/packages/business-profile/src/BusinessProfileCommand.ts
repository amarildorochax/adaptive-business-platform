/**
 * Business Profile Command — os três Commands já catalogados em `COMMAND_CATALOG.md`, seção "Business
 * Profile Engine" (`CreateBusinessProfile`, `EnableCapability`, `DisableCapability`). Este arquivo
 * declara o catálogo completo, mesma disciplina já aplicada por `CommerceEvent.ts` (IMP-006) e
 * `ContentEvent.ts` (IMP-004): declarar todos os tipos já aprovados, ainda que apenas um subconjunto
 * tenha produtor real nesta Sprint — `EnableCapability`/`DisableCapability` dependem do Capabilities
 * Engine e do Feature Advisor, nenhum dos dois no escopo "curto prazo" do Roadmap deste Blueprint
 * (Capítulo 21); nenhum Service os produz nesta Sprint (ver relatório).
 */
export type BusinessProfileCommandType = "CreateBusinessProfile" | "EnableCapability" | "DisableCapability";

export interface BusinessProfileCommand {
  /** Identificador de operação, único por execução — garante Idempotência (ex.: "por identificador do Tenant" para CreateBusinessProfile). */
  readonly operationId: string;

  /** Tipo do Comando. */
  readonly type: BusinessProfileCommandType;

  /** Momento em que o Comando foi recebido pelo Profile Manager. */
  readonly requestedAt: Date;
}
