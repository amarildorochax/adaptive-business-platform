// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo fiscal — Fiscal (documentos e obrigações fiscais).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class FiscalManager implements IModule {
  readonly id = 'fiscal';

  readonly name = 'Fiscal';

  init(): void {}

  start(): void {}

  stop(): void {}
}
