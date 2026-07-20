// HookManager.ts
//
// Responsabilidade:
// Futuramente gerenciará hooks de extensão executados em pontos
// específicos do ciclo de automação. Implementa IAutomation como
// contrato comum dos motores de automação; sem implementação nesta
// etapa.

import type { IAutomation } from '@/shared/interfaces';

export class HookManager implements IAutomation {
  readonly id = 'hook-manager';

  init(): void {}

  start(): void {}

  stop(): void {}
}
