// PolicyManager.ts
//
// Responsabilidade:
// Futuramente gerenciará políticas que restringem ou condicionam a
// execução de automações. Implementa IAutomation como contrato comum dos
// motores de automação; sem implementação nesta etapa.

import type { IAutomation } from '@/shared/interfaces';

export class PolicyManager implements IAutomation {
  readonly id = 'policy-manager';

  init(): void {}

  start(): void {}

  stop(): void {}
}
