// ConnectorManager.ts
//
// Responsabilidade:
// Gerenciará o ciclo de vida dos conectores (inicialização, encerramento,
// health-check). Futuramente orquestrará instâncias de BaseConnector
// registradas no ConnectorRegistry. Implementa ILifecycle porque
// gerenciar conectores implica ter seu próprio init/start/stop; ainda
// sem lógica de negócio.

import type { ILifecycle } from '@/shared/interfaces';

export class ConnectorManager implements ILifecycle {
  init(): void {}

  start(): void {}

  stop(): void {}
}
