/**
 * Configuração de segurança da autenticação — único ponto de leitura de `process.env` para este
 * assunto, mesma disciplina já aplicada por `resolveApiConfig`/`resolvePersistenceConfig`.
 *
 * `ABP_AUTH_PEPPER` é o segredo do servidor usado para derivar o salt de hashing de senha
 * (`passwordHashing.ts`) — nunca armazenado, nunca persistido, apenas mantido em memória do
 * processo. O valor padrão é seguro apenas para desenvolvimento local; um ambiente de produção real
 * DEVE sobrescrevê-lo (documentado como limitação explícita no relatório desta Sprint).
 */
export interface AuthConfig {
  readonly pepper: string;
}

const DEV_ONLY_DEFAULT_PEPPER = "abp-dev-only-pepper-never-use-in-production";

export function resolveAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  return {
    pepper: env.ABP_AUTH_PEPPER ?? DEV_ONLY_DEFAULT_PEPPER,
  };
}
