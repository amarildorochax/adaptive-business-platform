// BaseConnector.ts
//
// Responsabilidade:
// Classe base para futuros conectores externos (integrações com
// serviços de terceiros). Implementa IConnector como contrato comum que
// conectores concretos deverão seguir. `id` é abstrato porque cada
// conector concreto define sua própria identidade; os demais membros
// têm apenas stubs neutros, sem lógica de negócio.

import type { IConnector } from '@/shared/interfaces';

export abstract class BaseConnector implements IConnector {
  abstract readonly id: string;

  init(): void {}

  start(): void {}

  stop(): void {}

  isConnected(): boolean {
    return false;
  }
}
