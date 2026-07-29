// TimeoutPolicy.ts
//
// Responsabilidade:
// Estrutura de configuração de timeout — nenhuma imposição real de
// tempo limite ocorre nesta Sprint (`TimeoutMiddleware` apenas carrega
// esta política; não há `Promise.race`/cancelamento implementado).

export interface TimeoutPolicy {
  timeoutMs: number;
}

/** Política padrão — 30s, valor apenas configurado, nunca aplicado nesta Sprint. */
export const defaultTimeoutPolicy: TimeoutPolicy = {
  timeoutMs: 30000,
};
