// IConnector.ts
//
// Responsabilidade:
// Contrato para os conectores externos de src/core/connectors/*. Combina
// identidade (IService) e ciclo de vida (ILifecycle) e acrescenta a
// verificação de estado de conexão, para que o futuro ConnectorManager
// possa tratar qualquer conector de forma genérica.

import type { IService } from './IService';
import type { ILifecycle } from './ILifecycle';

export interface IConnector extends IService, ILifecycle {
  isConnected(): boolean;
}
