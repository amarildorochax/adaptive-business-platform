/** Configuração da API — único ponto de leitura de `process.env` deste app, mesma disciplina já aplicada por `resolvePersistenceConfig` (`@abp/persistence`). */
export interface ApiConfig {
  readonly port: number;
  readonly host: string;
  /** Origem exata permitida por CORS (`plugins/cors.ts`, FUN-100) — nunca `*`, para que `Authorization` cruze origem com segurança em produção. */
  readonly webOrigin: string;
}

export function resolveApiConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  return {
    port: env.ABP_API_PORT ? Number.parseInt(env.ABP_API_PORT, 10) : 3001,
    host: env.ABP_API_HOST ?? "127.0.0.1",
    webOrigin: env.ABP_WEB_ORIGIN ?? "http://localhost:5173",
  };
}
