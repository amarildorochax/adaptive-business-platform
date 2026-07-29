// cache.ts
//
// Responsabilidade:
// Reexporta o contrato de cache já criado na Sprint 29A
// (`@/app/features/dashboard/controllers/cache`) — a camada de
// integração não define um segundo contrato de cache; reutiliza o
// mesmo `WidgetCacheStrategy`/`CacheEntry`/`CachePolicy` e o
// `noopCacheStrategy` (nenhuma implementação real, conforme exigido).

export type { CacheEntry, CachePolicy, WidgetCacheStrategy } from '@/app/features/dashboard/controllers/cache';
export { noopCacheStrategy } from '@/app/features/dashboard/controllers/cache';
