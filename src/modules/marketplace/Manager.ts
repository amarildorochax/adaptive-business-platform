// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo marketplace — Marketplace (produtos e integrações de terceiros).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class MarketplaceManager implements IModule {
  readonly id = 'marketplace';

  readonly name = 'Marketplace';

  init(): void {}

  start(): void {}

  stop(): void {}
}
