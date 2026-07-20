// WorkflowEngine.ts
//
// Responsabilidade:
// Futuramente executará fluxos de trabalho compostos por múltiplas
// etapas automatizadas. Implementa IAutomation como contrato comum dos
// motores de automação; sem implementação nesta etapa.

import type { IAutomation } from '@/shared/interfaces';

export class WorkflowEngine implements IAutomation {
  readonly id = 'workflow-engine';

  init(): void {}

  start(): void {}

  stop(): void {}
}
