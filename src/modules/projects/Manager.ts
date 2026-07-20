// Manager.ts
//
// Responsabilidade:
// Ponto de entrada para a lógica futura do módulo projects — Projetos (planejamento e execução).
// Implementa IModule como contrato comum exigido pelo futuro
// ModuleRegistry; sem lógica de negócio nesta etapa.

import type { IModule } from '@/shared/interfaces';

export class ProjectsManager implements IModule {
  readonly id = 'projects';

  readonly name = 'Projects';

  init(): void {}

  start(): void {}

  stop(): void {}
}
