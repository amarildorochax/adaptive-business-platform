// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo academy — Academy (treinamentos e conteúdo educacional).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class AcademyManager implements IModule {
  readonly id = 'academy';

  readonly name = 'Academy';

  init(): void {}

  start(): void {}

  stop(): void {}
}
