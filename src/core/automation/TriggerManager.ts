// TriggerManager.ts
//
// Responsabilidade:
// Futuramente gerenciará gatilhos que iniciam workflows a partir de
// eventos da plataforma. Implementa IAutomation como contrato comum dos
// motores de automação; sem implementação nesta etapa.

import type { IAutomation } from '@/shared/interfaces';

export class TriggerManager implements IAutomation {
  readonly id = 'trigger-manager';

  init(): void {}

  start(): void {}

  stop(): void {}
}
