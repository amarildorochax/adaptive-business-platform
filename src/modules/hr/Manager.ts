// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo hr — RH (colaboradores e departamento pessoal).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class HrManager implements IModule {
  readonly id = 'hr';

  readonly name = 'HR';

  init(): void {}

  start(): void {}

  stop(): void {}
}
