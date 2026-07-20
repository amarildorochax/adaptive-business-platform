// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo crm — CRM (relacionamento com clientes).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class CrmManager implements IModule {
  readonly id = 'crm';

  readonly name = 'CRM';

  init(): void {}

  start(): void {}

  stop(): void {}
}
