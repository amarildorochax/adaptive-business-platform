// RuleEngine.ts
//
// Responsabilidade:
// Futuramente avaliará regras de negócio configuráveis usadas por
// workflows e triggers. Implementa IAutomation como contrato comum dos
// motores de automação; sem implementação nesta etapa.

import type { IAutomation } from '@/shared/interfaces';

export class RuleEngine implements IAutomation {
  readonly id = 'rule-engine';

  init(): void {}

  start(): void {}

  stop(): void {}
}
