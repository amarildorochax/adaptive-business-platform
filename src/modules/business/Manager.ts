// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo business — Negócios (dados e operações da empresa).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class BusinessManager implements IModule {
  readonly id = 'business';

  readonly name = 'Business';

  init(): void {}

  start(): void {}

  stop(): void {}
}
