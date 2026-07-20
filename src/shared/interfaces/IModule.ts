// IModule.ts
//
// Responsabilidade:
// Contrato para os módulos de negócio de src/modules/* (crm, hr, fiscal,
// etc). Combina identidade (IService) e ciclo de vida (ILifecycle) para
// que um futuro ModuleRegistry possa tratar qualquer módulo de forma
// genérica, sem conhecer sua lógica interna.

import type { IService } from './IService';
import type { ILifecycle } from './ILifecycle';

export interface IModule extends IService, ILifecycle {
  readonly name: string;
}
