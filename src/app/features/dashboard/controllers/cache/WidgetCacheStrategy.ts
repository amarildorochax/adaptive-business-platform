// WidgetCacheStrategy.ts
//
// Responsabilidade:
// Contrato de cache por widget — preparação arquitetural exigida pela
// Sprint 29A. NENHUM cache real é implementado: `noopCacheStrategy` é
// um "null object" que nunca retorna um hit e nunca persiste nada,
// usado como valor padrão até uma Sprint futura implementar uma
// estratégia real (memória, localStorage, etc.) sem precisar alterar o
// contrato nem `WidgetController`.

export interface CacheEntry<Data> {
  data: Data;
  cachedAt: string;
  expiresAt: string;
}

export type CachePolicy = { mode: 'none' } | { mode: 'ttl'; ttlMs: number };

export interface WidgetCacheStrategy {
  get<Data>(widgetId: string): CacheEntry<Data> | null;
  set<Data>(widgetId: string, data: Data, policy: CachePolicy): void;
  invalidate(widgetId: string): void;
}

/** Estratégia nula — nunca há cache hit, `set`/`invalidate` não fazem nada. Valor padrão até uma implementação real existir. */
export const noopCacheStrategy: WidgetCacheStrategy = {
  get: () => null,
  set: () => undefined,
  invalidate: () => undefined,
};
