// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo analytics — Analytics (métricas e relatórios).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class AnalyticsManager implements IModule {
  readonly id = 'analytics';

  readonly name = 'Analytics';

  init(): void {}

  start(): void {}

  stop(): void {}
}
