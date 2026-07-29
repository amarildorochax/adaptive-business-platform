// CoreStatus.ts
//
// Responsabilidade:
// Contrato de saúde/status de um módulo do Core, consumido por
// `useCoreHealth`/`useCoreStatus`. Nenhum Adapter faz uma checagem real
// ainda — todo `health()` retorna `'unknown'`.

export type CoreModuleStatus = 'unknown' | 'available' | 'degraded' | 'unavailable';

export interface CoreHealthSnapshot {
  moduleId: string;
  status: CoreModuleStatus;
  checkedAt: string;
  detail?: string;
}
