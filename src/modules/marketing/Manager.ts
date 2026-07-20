// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo marketing — Marketing (campanhas e conteúdo).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class MarketingManager implements IModule {
  readonly id = 'marketing';

  readonly name = 'Marketing';

  init(): void {}

  start(): void {}

  stop(): void {}
}
