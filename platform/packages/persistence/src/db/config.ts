/**
 * Ambiente de persistência — o "mecanismo único para escolher Development/Testing/Production"
 * exigido por esta Sprint. Nunca lido diretamente por nenhum Repository — apenas por
 * `createDatabase` (`client.ts`) e por `createManagerRegistry` (`../composition/createManagerRegistry.ts`),
 * os dois únicos pontos centralizados de decisão desta Sprint.
 */
export type PersistenceEnvironment = "development" | "testing" | "production";

export interface PersistenceConfig {
  readonly environment: PersistenceEnvironment;
  /** Caminho do arquivo SQLite, ou `:memory:` — sempre `:memory:` em `testing`, salvo override explícito. */
  readonly databasePath: string;
}

/**
 * Resolve a configuração a partir de variáveis de ambiente (`ABP_ENV`, `ABP_DATABASE_PATH`) —
 * nunca lida em nenhum outro lugar do pacote. `ABP_ENV` ausente resolve para `development`,
 * consistente com o padrão já usado por `NODE_ENV` em todo projeto Node.
 */
export function resolvePersistenceConfig(env: NodeJS.ProcessEnv = process.env): PersistenceConfig {
  const environment: PersistenceEnvironment = env.ABP_ENV === "testing" || env.ABP_ENV === "production" ? env.ABP_ENV : "development";

  const defaultPath = environment === "testing" ? ":memory:" : "./data/adaptive-business-platform.sqlite3";

  return {
    environment,
    databasePath: env.ABP_DATABASE_PATH ?? defaultPath,
  };
}
