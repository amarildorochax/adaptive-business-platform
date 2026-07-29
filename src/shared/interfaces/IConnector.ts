import type { IService } from './IService';
import type { ILifecycle } from './ILifecycle';

/**
 * Contrato para os conectores externos de `src/core/connectors/*`.
 *
 * Responsabilidade: combinar identidade (IService) e ciclo de vida
 * (ILifecycle), e acrescentar `isConnected()`, para que o futuro
 * ConnectorManager trate qualquer conector de forma genérica.
 *
 * Dependências: IService, ILifecycle.
 *
 * Exemplo de uso: ver BaseConnector.ts, a classe base abstrata que
 * implementa este contrato para todo conector concreto futuro.
 */
export interface IConnector extends IService, ILifecycle {
  isConnected(): boolean;
}
