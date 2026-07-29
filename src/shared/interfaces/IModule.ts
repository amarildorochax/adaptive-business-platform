import type { IService } from './IService';
import type { ILifecycle } from './ILifecycle';

/**
 * Contrato para os módulos de negócio de `src/modules/*` (crm, hr,
 * fiscal, etc.).
 *
 * Responsabilidade: combinar identidade (IService) e ciclo de vida
 * (ILifecycle), e acrescentar `name` (rótulo legível, distinto de `id`),
 * para que um futuro ModuleRegistry trate qualquer módulo de forma
 * genérica, sem conhecer sua lógica interna.
 *
 * Dependências: IService, ILifecycle.
 *
 * Exemplo de uso:
 * ```ts
 * export class CrmManager implements IModule {
 *   readonly id = 'crm';
 *   readonly name = 'CRM';
 *   init(): void {}
 *   start(): void {}
 *   stop(): void {}
 * }
 * ```
 */
export interface IModule extends IService, ILifecycle {
  readonly name: string;
}
