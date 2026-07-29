import type { IService } from './IService';
import type { ILifecycle } from './ILifecycle';

/**
 * Contrato para os motores de automação de `src/core/automation/*`
 * (WorkflowEngine, RuleEngine, TriggerManager, HookManager,
 * PolicyManager).
 *
 * Responsabilidade: combinar identidade (IService) e ciclo de vida
 * (ILifecycle) para permitir composição/registro genérico futuro.
 * Intencionalmente sem membros próprios além dos herdados.
 *
 * Dependências: IService, ILifecycle.
 */
export interface IAutomation extends IService, ILifecycle {}
