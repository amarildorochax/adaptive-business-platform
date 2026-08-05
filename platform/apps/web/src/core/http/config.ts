/** Configuração única do cliente HTTP — único ponto de leitura de `import.meta.env` desta camada; nenhum outro arquivo lê a URL da API diretamente. */
export interface ApiClientConfig {
  readonly baseUrl: string;
  readonly timeoutMs: number;
}

export function resolveApiClientConfig(env: ImportMetaEnv = import.meta.env): ApiClientConfig {
  return {
    baseUrl: env.VITE_ABP_API_BASE_URL ?? "http://127.0.0.1:3001",
    timeoutMs: 10_000,
  };
}
