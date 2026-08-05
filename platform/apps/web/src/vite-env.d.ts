/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL da API HTTP (`apps/api`, FUN-004) — único lugar fora de `core/http/config.ts` que a nomeia. */
  readonly VITE_ABP_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
