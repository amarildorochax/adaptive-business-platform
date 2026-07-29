/**
 * Execution Context — estabelecido e propagado pelo Execution Context Manager por toda a vida de uma
 * execução: identificador de correlação, Tenant, e Identidade solicitante. Nenhum dado de domínio é
 * armazenado aqui — apenas o necessário para rastreabilidade e para autorização
 * (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 11).
 * `identityId` é sempre opaco — nenhum tipo de `@abp/platform-services` é importado.
 * Estrutura definida em `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 5 e 11.
 */
export interface ExecutionContext {
  /** Identificador do Execution Context. */
  readonly executionContextId: string;

  /** Identificador de correlação, propagado por toda a cadeia de execução. */
  readonly correlationId: string;

  /** Tenant ao qual esta execução pertence — isolamento absoluto entre Empresas. */
  readonly tenantId: string;

  /** Identidade solicitante — identificador opaco do Identity Hub, nunca um tipo importado. */
  readonly identityId: string;

  /** Momento de estabelecimento do contexto. */
  readonly establishedAt: Date;
}
